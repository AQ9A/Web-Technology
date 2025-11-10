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
 * Note: Requires SHODAN_API_KEY environment variable
 */
export async function getShodanHostInfo(ip: string): Promise<ShodanHostInfo | null> {
  const apiKey = process.env.SHODAN_API_KEY;
  
  if (!apiKey) {
    console.warn('[Shodan] API key not configured, skipping Shodan lookup');
    return null;
  }

  try {
    const response = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`);
    
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
 */
export async function searchShodanDomain(domain: string): Promise<any | null> {
  const apiKey = process.env.SHODAN_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.shodan.io/shodan/host/search?key=${apiKey}&query=hostname:${domain}`
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
