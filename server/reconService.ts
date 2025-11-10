import dns from 'dns/promises';
import https from 'https';
import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as db from './db';
import * as securityTrails from './securityTrailsService';
import { getBannerInfo } from './bannerGrabbing';
import { getShodanHostInfo } from './shodanService';

const execAsync = promisify(exec);

/**
 * Map port number to service name
 */
function getServiceName(port: number): string {
  const serviceMap: { [key: number]: string } = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    465: 'SMTPS',
    587: 'SMTP (Submission)',
    993: 'IMAPS',
    995: 'POP3S',
    1433: 'MSSQL',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC',
    6379: 'Redis',
    8000: 'HTTP-Alt',
    8080: 'HTTP-Proxy',
    8443: 'HTTPS-Alt',
    8888: 'HTTP-Alt',
    9000: 'SonarQube',
    27017: 'MongoDB'
  };
  return serviceMap[port] || 'Unknown';
}

interface WhoisData {
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  nameServers?: string[];
  status?: string[];
  rawData: string;
}

interface DnsRecordResult {
  type: string;
  value: string;
}

interface SubdomainResult {
  subdomain: string;
  ipAddress?: string;
  isAlive: boolean;
  statusCode?: number;
}

interface PortResult {
  port: number;
  service?: string;
  version?: string;
  state: string;
}

interface TechnologyResult {
  name: string;
  version?: string;
  category?: string;
  confidence?: number;
}

interface SslCertInfo {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  signatureAlgorithm: string;
  isValid: boolean;
}

interface VulnerabilityResult {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  affectedUrl?: string;
}

/**
 * Perform WHOIS lookup
 */
export async function performWhoisLookup(domain: string): Promise<WhoisData> {
  try {
    // Try using whois command if available
    const { stdout } = await execAsync(`whois ${domain}`, { timeout: 10000 });
    
    const lines = stdout.split('\n');
    const data: WhoisData = {
      rawData: stdout,
      nameServers: [],
      status: []
    };

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('registrar:')) {
        data.registrar = line.split(':')[1]?.trim();
      } else if (lower.includes('creation date:') || lower.includes('created:')) {
        data.creationDate = line.split(':').slice(1).join(':').trim();
      } else if (lower.includes('expiration date:') || lower.includes('expires:') || lower.includes('registry expiry date:')) {
        data.expirationDate = line.split(':').slice(1).join(':').trim();
      } else if (lower.includes('name server:') || lower.includes('nserver:')) {
        const ns = line.split(':')[1]?.trim();
        if (ns && data.nameServers) data.nameServers.push(ns);
      } else if (lower.includes('status:')) {
        const status = line.split(':')[1]?.trim();
        if (status && data.status) data.status.push(status);
      }
    }

    return data;
  } catch (error) {
    console.warn('WHOIS lookup failed, continuing with limited data:', error);
    // Return minimal data instead of failing
    return {
      rawData: `WHOIS lookup not available for this domain`,
      nameServers: [],
      status: []
    };
  }
}

/**
 * Perform DNS lookups
 */
export async function performDnsLookup(domain: string): Promise<DnsRecordResult[]> {
  const records: DnsRecordResult[] = [];

  try {
    // A Records
    const aRecords = await dns.resolve4(domain).catch(() => []);
    aRecords.forEach(ip => records.push({ type: 'A', value: ip }));

    // AAAA Records
    const aaaaRecords = await dns.resolve6(domain).catch(() => []);
    aaaaRecords.forEach(ip => records.push({ type: 'AAAA', value: ip }));

    // MX Records
    const mxRecords = await dns.resolveMx(domain).catch(() => []);
    mxRecords.forEach(mx => records.push({ type: 'MX', value: `${mx.priority} ${mx.exchange}` }));

    // NS Records
    const nsRecords = await dns.resolveNs(domain).catch(() => []);
    nsRecords.forEach(ns => records.push({ type: 'NS', value: ns }));

    // TXT Records
    const txtRecords = await dns.resolveTxt(domain).catch(() => []);
    txtRecords.forEach(txt => records.push({ type: 'TXT', value: txt.join(' ') }));

    // CNAME Records
    const cnameRecords = await dns.resolveCname(domain).catch(() => []);
    cnameRecords.forEach(cname => records.push({ type: 'CNAME', value: cname }));

  } catch (error) {
    console.error('DNS lookup failed:', error);
  }

  return records;
}

/**
 * Discover subdomains using common patterns and DNS brute force
 */
export async function discoverSubdomains(domain: string): Promise<SubdomainResult[]> {
  const commonSubdomains = [
    'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'webdisk',
    'ns2', 'cpanel', 'whm', 'autodiscover', 'autoconfig', 'test', 'dev', 'staging',
    'api', 'admin', 'blog', 'shop', 'forum', 'support', 'portal', 'cdn', 'static',
    'assets', 'images', 'img', 'js', 'css', 'app', 'mobile', 'm', 'vpn', 'remote',
    'git', 'jenkins', 'gitlab', 'github', 'bitbucket', 'jira', 'confluence'
  ];

  const results: SubdomainResult[] = [];

  for (const sub of commonSubdomains) {
    const fullDomain = `${sub}.${domain}`;
    try {
      const addresses = await dns.resolve4(fullDomain);
      if (addresses.length > 0) {
        results.push({
          subdomain: fullDomain,
          ipAddress: addresses[0],
          isAlive: true
        });
      }
    } catch (error) {
      // Subdomain doesn't exist or not resolvable
    }
  }

  return results;
}

/**
 * Scan common ports on a host
 */
async function scanPorts(host: string): Promise<PortResult[]> {
  // Comprehensive list of common ports to scan
  const commonPorts = [
    { port: 21, service: 'FTP' },
    { port: 22, service: 'SSH' },
    { port: 23, service: 'Telnet' },
    { port: 25, service: 'SMTP' },
    { port: 53, service: 'DNS' },
    { port: 80, service: 'HTTP' },
    { port: 110, service: 'POP3' },
    { port: 143, service: 'IMAP' },
    { port: 443, service: 'HTTPS' },
    { port: 465, service: 'SMTPS' },
    { port: 587, service: 'SMTP (Submission)' },
    { port: 993, service: 'IMAPS' },
    { port: 995, service: 'POP3S' },
    { port: 1433, service: 'MSSQL' },
    { port: 3306, service: 'MySQL' },
    { port: 3389, service: 'RDP' },
    { port: 5432, service: 'PostgreSQL' },
    { port: 5900, service: 'VNC' },
    { port: 6379, service: 'Redis' },
    { port: 8000, service: 'HTTP-Alt' },
    { port: 8080, service: 'HTTP-Proxy' },
    { port: 8443, service: 'HTTPS-Alt' },
    { port: 8888, service: 'HTTP-Alt' },
    { port: 9000, service: 'SonarQube' },
    { port: 27017, service: 'MongoDB' },
  ];

  const results: PortResult[] = [];
  const timeout = 3000; // 3 seconds timeout for each port

  console.log(`Starting port scan on ${host}...`);

  // Scan ports with proper TCP connection testing
  const scanPromises = commonPorts.map(async ({ port, service }) => {
    return new Promise<PortResult | null>((resolve) => {
      const socket = new net.Socket();
      let isResolved = false;

      const cleanup = () => {
        if (!isResolved) {
          isResolved = true;
          socket.destroy();
        }
      };

      // Set timeout
      const timer = setTimeout(() => {
        cleanup();
        resolve(null); // Port is closed/filtered
      }, timeout);

      socket.on('connect', () => {
        clearTimeout(timer);
        cleanup();
        // Port is OPEN - return result
        resolve({
          port,
          service,
          state: 'open',
          version: undefined
        });
      });

      socket.on('error', () => {
        clearTimeout(timer);
        cleanup();
        resolve(null); // Port is closed/filtered
      });

      // Attempt connection
      try {
        socket.connect(port, host);
      } catch (error) {
        clearTimeout(timer);
        cleanup();
        resolve(null);
      }
    });
  });

  // Wait for all scans to complete
  const scanResults = await Promise.all(scanPromises);
  
  // Filter out null results (closed ports) and collect only open ports
  for (const result of scanResults) {
    if (result !== null) {
      results.push(result);
      console.log(`Found open port: ${result.port} (${result.service})`);
    }
  }

  console.log(`Port scan completed. Found ${results.length} open ports.`);
  return results;
}

/**
 * Detect technologies using HTTP headers and response analysis
 */
export async function detectTechnologies(domain: string): Promise<TechnologyResult[]> {
  const technologies: TechnologyResult[] = [];

  try {
    const response = await fetch(`https://${domain}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReconBot/1.0)'
      }
    });

    const headers = response.headers;
    const html = await response.text();

    // Server detection
    const server = headers.get('server');
    if (server) {
      technologies.push({
        name: server.split('/')[0],
        version: server.split('/')[1],
        category: 'Web Server',
        confidence: 100
      });
    }

    // X-Powered-By detection
    const poweredBy = headers.get('x-powered-by');
    if (poweredBy) {
      technologies.push({
        name: poweredBy.split('/')[0],
        version: poweredBy.split('/')[1],
        category: 'Programming Language',
        confidence: 100
      });
    }

    // Framework detection from HTML
    if (html.includes('wp-content') || html.includes('wordpress')) {
      technologies.push({
        name: 'WordPress',
        category: 'CMS',
        confidence: 90
      });
    }

    if (html.includes('Joomla')) {
      technologies.push({
        name: 'Joomla',
        category: 'CMS',
        confidence: 90
      });
    }

    if (html.includes('Drupal')) {
      technologies.push({
        name: 'Drupal',
        category: 'CMS',
        confidence: 90
      });
    }

    // JavaScript frameworks
    if (html.includes('react') || html.includes('React')) {
      technologies.push({
        name: 'React',
        category: 'JavaScript Framework',
        confidence: 80
      });
    }

    if (html.includes('vue') || html.includes('Vue')) {
      technologies.push({
        name: 'Vue.js',
        category: 'JavaScript Framework',
        confidence: 80
      });
    }

    if (html.includes('angular') || html.includes('Angular')) {
      technologies.push({
        name: 'Angular',
        category: 'JavaScript Framework',
        confidence: 80
      });
    }

  } catch (error) {
    console.error('Technology detection failed:', error);
  }

  return technologies;
}

/**
 * Get SSL certificate information
 */
export async function getSslCertificate(domain: string): Promise<SslCertInfo | null> {
  return new Promise((resolve) => {
    const options = {
      host: domain,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      const cert = (res.socket as any).getPeerCertificate();
      
      if (cert && Object.keys(cert).length > 0) {
        const now = new Date();
        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        
        resolve({
          issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
          subject: cert.subject?.CN || 'Unknown',
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          serialNumber: cert.serialNumber || 'Unknown',
          signatureAlgorithm: cert.sigalg || 'Unknown',
          isValid: now >= validFrom && now <= validTo
        });
      } else {
        resolve(null);
      }
    });

    req.on('error', () => {
      resolve(null);
    });

    req.end();
  });
}

/**
 * Check for common vulnerabilities
 */
export async function checkVulnerabilities(domain: string): Promise<VulnerabilityResult[]> {
  const vulnerabilities: VulnerabilityResult[] = [];

  try {
    const response = await fetch(`https://${domain}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReconBot/1.0)'
      }
    });

    const headers = response.headers;

    // Check for missing security headers
    if (!headers.get('strict-transport-security')) {
      vulnerabilities.push({
        title: 'Missing HSTS Header',
        severity: 'medium',
        description: 'The Strict-Transport-Security header is not set, which could allow man-in-the-middle attacks.',
        recommendation: 'Add the Strict-Transport-Security header to enforce HTTPS connections.',
        affectedUrl: `https://${domain}`
      });
    }

    if (!headers.get('x-frame-options') && !headers.get('content-security-policy')) {
      vulnerabilities.push({
        title: 'Missing Clickjacking Protection',
        severity: 'medium',
        description: 'Neither X-Frame-Options nor CSP frame-ancestors directive is set.',
        recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN header to prevent clickjacking attacks.',
        affectedUrl: `https://${domain}`
      });
    }

    if (!headers.get('x-content-type-options')) {
      vulnerabilities.push({
        title: 'Missing X-Content-Type-Options Header',
        severity: 'low',
        description: 'The X-Content-Type-Options header is not set.',
        recommendation: 'Add X-Content-Type-Options: nosniff header to prevent MIME-sniffing attacks.',
        affectedUrl: `https://${domain}`
      });
    }

    if (!headers.get('x-xss-protection')) {
      vulnerabilities.push({
        title: 'Missing XSS Protection Header',
        severity: 'low',
        description: 'The X-XSS-Protection header is not set.',
        recommendation: 'Add X-XSS-Protection: 1; mode=block header.',
        affectedUrl: `https://${domain}`
      });
    }

    // Check for server version disclosure
    const server = headers.get('server');
    if (server && server.includes('/')) {
      vulnerabilities.push({
        title: 'Server Version Disclosure',
        severity: 'low',
        description: `Server version is disclosed: ${server}`,
        recommendation: 'Configure the server to hide version information.',
        affectedUrl: `https://${domain}`
      });
    }

  } catch (error) {
    console.error('Vulnerability check failed:', error);
  }

  return vulnerabilities;
}

/**
 * Perform full reconnaissance scan
 */
export async function performFullScan(scanId: number, domain: string): Promise<void> {
  try {
    // Update scan status
    await db.updateScan(scanId, { status: 'running', progress: 10 });

    // WHOIS Lookup
    try {
      const whoisData = await performWhoisLookup(domain);
      await db.createWhoisInfo({
        scanId,
        registrar: whoisData.registrar,
        creationDate: whoisData.creationDate,
        expirationDate: whoisData.expirationDate,
        nameServers: whoisData.nameServers?.join(', '),
        status: whoisData.status?.join(', '),
        rawData: whoisData.rawData
      });
    } catch (error) {
      console.error('WHOIS step failed:', error);
    }
    await db.updateScan(scanId, { progress: 20 });

    // DNS Lookup
    try {
      const dnsRecords = await performDnsLookup(domain);
      for (const record of dnsRecords) {
        await db.createDnsRecord({
          scanId,
          recordType: record.type,
          value: record.value
        });
      }
    } catch (error) {
      console.error('DNS lookup step failed:', error);
    }
    await db.updateScan(scanId, { progress: 35 });

    // Subdomain Discovery
    try {
      const subdomains = await discoverSubdomains(domain);
      for (const sub of subdomains) {
        await db.createSubdomain({
          scanId,
          subdomain: sub.subdomain,
          ipAddress: sub.ipAddress,
          isAlive: sub.isAlive,
          statusCode: sub.statusCode
        });
      }
    } catch (error) {
      console.error('Subdomain discovery step failed:', error);
    }
    await db.updateScan(scanId, { progress: 50 });

    // Port Scanning (on main domain)
    try {
      const dnsRecords = await performDnsLookup(domain);
      const mainIp = dnsRecords.find(r => r.type === 'A')?.value;
      if (mainIp) {
        console.log(`[Port Scan] Scanning ${domain} (IP: ${mainIp})`);
        
        // Try Shodan first for more accurate results
        const shodanInfo = await getShodanHostInfo(mainIp);
        let ports: PortResult[] = [];
        
        if (shodanInfo && shodanInfo.ports && shodanInfo.ports.length > 0) {
          console.log(`[Shodan] Found ${shodanInfo.ports.length} open ports from Shodan database`);
          // Use Shodan's port data (more accurate, especially for Cloudflare-protected sites)
          ports = shodanInfo.ports.map(port => ({
            port,
            service: getServiceName(port),
            state: 'open',
            version: undefined
          }));
        } else {
          // Fallback to direct TCP scanning
          console.log(`[Port Scan] Shodan data not available, performing direct TCP scan...`);
          ports = await scanPorts(mainIp);
        }
        
        console.log(`[Port Scan] Found ${ports.length} open ports on ${domain} (${mainIp})`);
        
        // Perform banner grabbing for each open port
        for (const port of ports) {
          console.log(`[Banner Grab] Grabbing banner from port ${port.port}...`);
          const bannerInfo = await getBannerInfo(mainIp, port.port, port.service || 'Unknown');
          
          await db.createPort({
            scanId,
            host: mainIp,
            port: port.port,
            service: port.service,
            version: bannerInfo.version || port.version,
            state: port.state
          });
          
          if (bannerInfo.version) {
            console.log(`[Banner Grab] Port ${port.port}: ${bannerInfo.version}`);
          }
        }
      } else {
        console.warn(`[Port Scan] No A record found for ${domain}, skipping port scan`);
      }
    } catch (error) {
      console.error('Port scanning step failed:', error);
    }
    await db.updateScan(scanId, { progress: 65 });

    // Technology Detection
    try {
      const technologies = await detectTechnologies(domain);
      for (const tech of technologies) {
        await db.createTechnology({
          scanId,
          name: tech.name,
          version: tech.version,
          category: tech.category,
          confidence: tech.confidence
        });
      }
    } catch (error) {
      console.error('Technology detection step failed:', error);
    }
    await db.updateScan(scanId, { progress: 80 });

    // SSL Certificate Check
    try {
      const sslCert = await getSslCertificate(domain);
      if (sslCert) {
        await db.createSslCertificate({
          scanId,
          issuer: sslCert.issuer,
          subject: sslCert.subject,
          validFrom: sslCert.validFrom,
          validTo: sslCert.validTo,
          serialNumber: sslCert.serialNumber,
          signatureAlgorithm: sslCert.signatureAlgorithm,
          isValid: sslCert.isValid
        });
      }
    } catch (error) {
      console.error('SSL certificate check step failed:', error);
    }
    await db.updateScan(scanId, { progress: 90 });

    // Vulnerability Check
    try {
      // Vulnerability scanning removed - focusing on reconnaissance only
    } catch (error) {
      console.error('Vulnerability check step failed:', error);
    }
    await db.updateScan(scanId, { progress: 95 });

    // SecurityTrails Historical Data
    try {
      console.log('Fetching SecurityTrails historical data...');
      
      // Get historical DNS records
      const historicalDNSResult = await securityTrails.getDNSHistory(domain);
      if (historicalDNSResult) {
        for (const [recordType, data] of Object.entries(historicalDNSResult)) {
          if (data && data.records) {
            for (const record of data.records) {
              if (record.values && Array.isArray(record.values)) {
                for (const value of record.values) {
                  await db.createHistoricalDns({
                    scanId,
                    recordType: recordType.toUpperCase(),
                    value: value.ip || value.value || '',
                    firstSeen: value.first_seen,
                    lastSeen: value.last_seen
                  });
                }
              }
            }
          }
        }
      }

      // Get historical WHOIS data
      const historicalWhoisResult = await securityTrails.getHistoricalWhois(domain);
      if (historicalWhoisResult.data && historicalWhoisResult.data.result) {
        for (const whoisRecord of historicalWhoisResult.data.result) {
          await db.createHistoricalWhois({
            scanId,
            registrar: whoisRecord.registrar,
            created: whoisRecord.created,
            expires: whoisRecord.expires,
            updated: whoisRecord.updated,
            nameServers: whoisRecord.nameservers?.join(', '),
            registrantName: whoisRecord.contacts?.registrant?.name,
            registrantOrg: whoisRecord.contacts?.registrant?.organization
          });
        }
      }

      // Get historical IPs
      const historicalIPsResult = await securityTrails.getHistoricalIPs(domain);
      if (historicalIPsResult.data && historicalIPsResult.data.records) {
        for (const ipRecord of historicalIPsResult.data.records) {
          await db.createHistoricalIp({
            scanId,
            ipAddress: ipRecord.ip,
            firstSeen: ipRecord.first_seen,
            lastSeen: ipRecord.last_seen
          });
        }
      }

      // Enhanced subdomain discovery from SecurityTrails
      const stSubdomains = await securityTrails.getSubdomainsList(domain);
      if (stSubdomains && stSubdomains.length > 0) {
        console.log(`Found ${stSubdomains.length} additional subdomains from SecurityTrails`);
        for (const subdomain of stSubdomains.slice(0, 100)) { // Limit to 100 to avoid overwhelming
          const fullDomain = `${subdomain}.${domain}`;
          // Check if we already have this subdomain
          const existing = await db.getScanSubdomains(scanId);
          const alreadyExists = existing.some(s => s.subdomain === fullDomain);
          
          if (!alreadyExists) {
            await db.createSubdomain({
              scanId,
              subdomain: fullDomain,
              isAlive: false // We don't know yet, would need to check
            });
          }
        }
      }
    } catch (error) {
      console.error('SecurityTrails data fetch failed (continuing anyway):', error);
    }

    // Mark scan as completed
    await db.updateScan(scanId, { 
      status: 'completed', 
      progress: 100,
      completedAt: new Date()
    });

  } catch (error) {
    console.error('Scan failed:', error);
    await db.updateScan(scanId, { status: 'failed' });
  }
}
