import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * C99.nl Subdomain Finder Service
 * Scrapes subdomains from c99.nl subdomain finder
 */

export interface C99SubdomainResult {
  subdomains: string[];
  success: boolean;
  error?: string;
}

/**
 * Fetch subdomains from c99.nl subdomain finder
 * @param domain - The target domain to scan
 * @returns Array of discovered subdomains
 */
export async function fetchC99Subdomains(domain: string): Promise<C99SubdomainResult> {
  try {
    console.log(`[C99] Fetching subdomains for: ${domain}`);
    
    // Step 1: Make initial request to get scan started
    const startUrl = `https://subdomainfinder.c99.nl/scans.php?method=subdomain&domain=${encodeURIComponent(domain)}`;
    
    const response = await axios.get(startUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://subdomainfinder.c99.nl/'
      },
      timeout: 60000, // 60 second timeout
      maxRedirects: 5
    });

    // Step 2: Parse HTML to extract subdomains
    const $ = cheerio.load(response.data);
    const subdomains: string[] = [];

    // Look for subdomain results in the page
    // C99 typically displays results in a specific format
    $('table tr').each((_: number, element: any) => {
      const subdomain = $(element).find('td').first().text().trim();
      if (subdomain && subdomain.includes('.') && !subdomain.includes(' ')) {
        subdomains.push(subdomain);
      }
    });

    // Also check for JSON data in script tags
    $('script').each((_: number, element: any) => {
      const scriptContent = $(element).html() || '';
      const jsonMatch = scriptContent.match(/var\s+subdomains\s*=\s*(\[.*?\])/);
      if (jsonMatch) {
        try {
          const jsonSubdomains = JSON.parse(jsonMatch[1]);
          if (Array.isArray(jsonSubdomains)) {
            subdomains.push(...jsonSubdomains);
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    });

    // Remove duplicates and filter valid subdomains
    const uniqueSubdomains = Array.from(new Set(subdomains))
      .filter(sub => {
        // Must contain the target domain
        return sub.toLowerCase().includes(domain.toLowerCase()) &&
               // Must be a valid subdomain format
               /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(sub);
      });

    console.log(`[C99] Found ${uniqueSubdomains.length} subdomains`);

    return {
      subdomains: uniqueSubdomains,
      success: true
    };

  } catch (error) {
    console.error('[C99] Error fetching subdomains:', error);
    return {
      subdomains: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Merge C99 subdomains with existing subdomains
 * @param existing - Existing subdomains from other sources
 * @param c99Subdomains - Subdomains from C99
 * @returns Merged and deduplicated list
 */
export function mergeSubdomains(existing: string[], c99Subdomains: string[]): string[] {
  const combined = [...existing, ...c99Subdomains];
  const unique = Array.from(new Set(combined.map(s => s.toLowerCase())));
  return unique.sort();
}
