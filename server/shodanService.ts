/**
 * Shodan API Integration
 * Provides additional reconnaissance data from Shodan
 */

export interface ShodanHostInfo {
  ip: string;
  ports: number[];
  hostnames: string[];
  os?: string;
  organization?: string;
  isp?: string;
  asn?: string;
  country?: string;
  city?: string;
  vulns?: string[];
}

/**
 * Get host information from Shodan
 * @param ip - IP address to lookup
 * @param apiKey - Optional Shodan API key (uses env var if not provided)
 */
export async function getShodanHostInfo(ip: string, apiKey?: string): Promise<ShodanHostInfo | null> {
  const key = apiKey || process.env.SHODAN_API_KEY;
  
  if (!key) {
    console.warn('[Shodan] API key not configured, skipping Shodan lookup');
    return null;
  }

  try {
    const response = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${key}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[Shodan] No information found for IP ${ip}`);
        return null;
      }
      throw new Error(`Shodan API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      ip,
      ports: data.ports || [],
      hostnames: data.hostnames || [],
      os: data.os || undefined,
      organization: data.org || undefined,
      isp: data.isp || undefined,
      asn: data.asn || undefined,
      country: data.country_name || undefined,
      city: data.city || undefined,
      vulns: data.vulns || []
    };
  } catch (error) {
    console.error('[Shodan] Failed to fetch host info:', error);
    return null;
  }
}

/**
 * Search Shodan for a domain
 * @param domain - Domain to search
 * @param apiKey - Optional Shodan API key (uses env var if not provided)
 */
export async function searchShodanDomain(domain: string, apiKey?: string): Promise<any | null> {
  const key = apiKey || process.env.SHODAN_API_KEY;
  
  if (!key) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.shodan.io/shodan/host/search?key=${key}&query=hostname:${domain}`
    );
    
    if (!response.ok) {
      throw new Error(`Shodan API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Shodan] Failed to search domain:', error);
    return null;
  }
}
