/**
 * crt.sh Certificate Transparency Subdomain Discovery Service
 * Uses Certificate Transparency logs to find subdomains
 */

export async function fetchSubdomainsFromCrtSh(domain: string): Promise<string[]> {
  try {
    console.log(`[crt.sh] Fetching subdomains for ${domain}...`);
    
    const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SubdomainScanner/1.0)',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      console.error(`[crt.sh] HTTP error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('[crt.sh] Invalid response format');
      return [];
    }

    // Extract unique subdomains
    const subdomains = new Set<string>();
    
    for (const entry of data) {
      if (entry.name_value) {
        // name_value can contain multiple domains separated by newlines
        const names = entry.name_value.split('\n');
        for (const name of names) {
          const cleaned = name.trim().toLowerCase();
          
          // Skip wildcards, emails, and invalid entries
          if (cleaned && 
              !cleaned.startsWith('*') && 
              !cleaned.includes('@') && 
              cleaned.includes('.') &&
              cleaned.endsWith(domain.toLowerCase())) {
            subdomains.add(cleaned);
          }
        }
      }
    }

    const result = Array.from(subdomains).sort();
    console.log(`[crt.sh] Found ${result.length} unique subdomains`);
    
    return result;
  } catch (error) {
    console.error('[crt.sh] Error fetching subdomains:', error);
    return [];
  }
}
