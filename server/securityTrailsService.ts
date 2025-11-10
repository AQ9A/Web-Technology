/**
 * SecurityTrails API Service
 * Provides access to historical domain data including DNS records, WHOIS, and subdomains
 */

const SECURITYTRAILS_API_BASE = 'https://api.securitytrails.com/v1';
const API_KEY = process.env.SECURITYTRAILS_API_KEY;

interface SecurityTrailsResponse<T> {
  data?: T;
  error?: string;
}

interface HistoricalDNSRecord {
  type: string;
  values: Array<{
    ip?: string;
    value?: string;
    first_seen: string;
    last_seen: string;
  }>;
}

interface HistoricalWhoisRecord {
  registrar?: string;
  created?: string;
  expires?: string;
  updated?: string;
  nameservers?: string[];
  contacts?: {
    registrant?: {
      name?: string;
      organization?: string;
      email?: string;
    };
  };
}

interface SubdomainData {
  subdomains: string[];
  count: number;
}

interface HistoricalIPRecord {
  ip: string;
  first_seen: string;
  last_seen: string;
}

/**
 * Make API request to SecurityTrails
 */
async function makeSecurityTrailsRequest<T>(endpoint: string): Promise<SecurityTrailsResponse<T>> {
  if (!API_KEY) {
    return { error: 'SecurityTrails API key not configured' };
  }

  try {
    const response = await fetch(`${SECURITYTRAILS_API_BASE}${endpoint}`, {
      headers: {
        'APIKEY': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `API request failed: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('SecurityTrails API request failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get domain details including current DNS records
 */
export async function getDomainDetails(domain: string) {
  return await makeSecurityTrailsRequest(`/domain/${domain}`);
}

/**
 * Get historical DNS records for a domain
 */
export async function getHistoricalDNS(domain: string, recordType: string = 'a') {
  return await makeSecurityTrailsRequest<{ records: HistoricalDNSRecord[] }>(
    `/history/${domain}/dns/${recordType}`
  );
}

/**
 * Get historical WHOIS data
 */
export async function getHistoricalWhois(domain: string) {
  return await makeSecurityTrailsRequest<{ result: HistoricalWhoisRecord[] }>(
    `/history/${domain}/whois`
  );
}

/**
 * Get all subdomains for a domain
 */
export async function getSubdomains(domain: string) {
  return await makeSecurityTrailsRequest<SubdomainData>(
    `/domain/${domain}/subdomains`
  );
}

/**
 * Get historical IP addresses for a domain
 */
export async function getHistoricalIPs(domain: string) {
  return await makeSecurityTrailsRequest<{ records: HistoricalIPRecord[] }>(
    `/history/${domain}/dns/a`
  );
}

/**
 * Get associated domains (domains on the same IP)
 */
export async function getAssociatedDomains(ipAddress: string) {
  return await makeSecurityTrailsRequest<{ records: Array<{ hostname: string }> }>(
    `/domains/list?ipv4=${ipAddress}`
  );
}

/**
 * Search for domains by keyword
 */
export async function searchDomains(keyword: string) {
  return await makeSecurityTrailsRequest(
    `/search/list?filter_keyword=${encodeURIComponent(keyword)}`
  );
}

/**
 * Get comprehensive historical data for a domain
 */
export async function getComprehensiveHistoricalData(domain: string) {
  const [
    domainDetails,
    historicalDNS,
    historicalWhois,
    subdomains,
    historicalIPs
  ] = await Promise.all([
    getDomainDetails(domain),
    getHistoricalDNS(domain, 'a'),
    getHistoricalWhois(domain),
    getSubdomains(domain),
    getHistoricalIPs(domain)
  ]);

  return {
    domainDetails,
    historicalDNS,
    historicalWhois,
    subdomains,
    historicalIPs
  };
}

/**
 * Get subdomain count and list
 */
export async function getSubdomainsList(domain: string): Promise<string[]> {
  const result = await getSubdomains(domain);
  
  if (result.error || !result.data) {
    console.error('Failed to fetch subdomains:', result.error);
    return [];
  }

  return result.data.subdomains || [];
}

/**
 * Get historical DNS changes summary
 */
export async function getDNSHistory(domain: string) {
  const types = ['a', 'aaaa', 'mx', 'ns', 'txt', 'soa'];
  const results: Record<string, any> = {};

  for (const type of types) {
    const result = await getHistoricalDNS(domain, type);
    if (!result.error && result.data) {
      results[type] = result.data;
    }
  }

  return results;
}
