import * as net from 'net';

export interface ServiceBanner {
  port: number;
  service: string;
  banner?: string;
  version?: string;
}

/**
 * Grab banner from a service to detect version
 */
export async function grabBanner(host: string, port: number, timeout: number = 5000): Promise<string | null> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = '';
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
      }
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve(banner || null);
    }, timeout);

    socket.on('data', (data) => {
      banner += data.toString('utf8');
      // For most services, the first chunk contains the banner
      if (banner.length > 10) {
        clearTimeout(timer);
        cleanup();
        resolve(banner);
      }
    });

    socket.on('error', () => {
      clearTimeout(timer);
      cleanup();
      resolve(null);
    });

    socket.on('connect', () => {
      // Send protocol-specific probes
      if (port === 22) {
        // SSH - just wait for banner
      } else if (port === 21) {
        // FTP - wait for welcome message
      } else if (port === 25 || port === 587) {
        // SMTP - wait for greeting
      } else if (port === 80 || port === 8080 || port === 8000 || port === 8888) {
        // HTTP - send HEAD request
        socket.write('HEAD / HTTP/1.0\r\nHost: ' + host + '\r\n\r\n');
      } else if (port === 443 || port === 8443) {
        // HTTPS - can't grab banner without TLS handshake
        clearTimeout(timer);
        cleanup();
        resolve(null);
      } else if (port === 3306) {
        // MySQL - wait for handshake
      } else if (port === 5432) {
        // PostgreSQL - need to send startup packet
        clearTimeout(timer);
        cleanup();
        resolve(null);
      } else if (port === 6379) {
        // Redis - send INFO command
        socket.write('INFO\r\n');
      } else if (port === 27017) {
        // MongoDB - binary protocol, skip
        clearTimeout(timer);
        cleanup();
        resolve(null);
      }
    });

    socket.connect(port, host);
  });
}

/**
 * Extract version information from banner
 */
export function extractVersion(banner: string, service: string): string | undefined {
  if (!banner) return undefined;

  const lines = banner.split('\n');
  const firstLine = lines[0]?.trim() || '';

  // SSH
  if (service === 'SSH' && firstLine.startsWith('SSH')) {
    const match = firstLine.match(/SSH-[\d.]+-(.+)/);
    return match ? match[1].trim() : firstLine;
  }

  // FTP
  if (service === 'FTP') {
    const match = firstLine.match(/220[- ](.+)/);
    return match ? match[1].trim() : undefined;
  }

  // SMTP
  if (service === 'SMTP' || service === 'SMTP (Submission)') {
    const match = firstLine.match(/220[- ](.+)/);
    return match ? match[1].trim() : undefined;
  }

  // HTTP/HTTPS
  if (service.includes('HTTP')) {
    const serverMatch = banner.match(/Server:\s*(.+)/i);
    if (serverMatch) return serverMatch[1].trim();
  }

  // MySQL
  if (service === 'MySQL') {
    // MySQL sends binary handshake, try to extract version
    const versionMatch = banner.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) return `MySQL ${versionMatch[1]}`;
  }

  // Redis
  if (service === 'Redis') {
    const versionMatch = banner.match(/redis_version:(\S+)/);
    if (versionMatch) return `Redis ${versionMatch[1]}`;
  }

  return undefined;
}

/**
 * Perform banner grabbing on an open port
 */
export async function getBannerInfo(host: string, port: number, service: string): Promise<ServiceBanner> {
  const banner = await grabBanner(host, port);
  const version = banner ? extractVersion(banner, service) : undefined;

  return {
    port,
    service,
    banner: banner || undefined,
    version
  };
}
