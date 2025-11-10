/**
 * Wayback Machine Service
 * Integrates with Internet Archive API to fetch historical snapshots
 */

interface WaybackSnapshot {
  timestamp: string; // Format: YYYYMMDDhhmmss
  url: string;
  status: string;
}

interface WaybackResponse {
  url: string;
  archived_snapshots: {
    closest?: {
      status: string;
      available: boolean;
      url: string;
      timestamp: string;
    };
  };
}

/**
 * Fetch available snapshots for a domain from Wayback Machine
 */
export async function fetchWaybackSnapshots(domain: string): Promise<WaybackSnapshot[]> {
  try {
    const url = `https://${domain}`;
    
    // CDX API for getting all snapshots
    const cdxUrl = `http://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=100&filter=statuscode:200`;
    
    const response = await fetch(cdxUrl);
    if (!response.ok) {
      console.log(`[Wayback] No snapshots found for ${domain}`);
      return [];
    }
    
    const data = await response.json();
    
    // CDX returns array of arrays, first row is headers
    if (!Array.isArray(data) || data.length <= 1) {
      return [];
    }
    
    const snapshots: WaybackSnapshot[] = [];
    
    // Skip first row (headers) and process data
    for (let i = 1; i < Math.min(data.length, 101); i++) {
      const row = data[i];
      if (row && row.length >= 3) {
        snapshots.push({
          timestamp: row[1], // timestamp
          url: `https://web.archive.org/web/${row[1]}/${row[2]}`, // archived URL
          status: row[4] || '200' // status code
        });
      }
    }
    
    console.log(`[Wayback] Found ${snapshots.length} snapshots for ${domain}`);
    return snapshots;
    
  } catch (error) {
    console.error('[Wayback] Error fetching snapshots:', error);
    return [];
  }
}

/**
 * Format timestamp to readable date
 */
export function formatWaybackTimestamp(timestamp: string): string {
  if (!timestamp || timestamp.length < 14) return timestamp;
  
  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hour = timestamp.substring(8, 10);
  const minute = timestamp.substring(10, 12);
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * Get the most recent snapshot for a domain
 */
export async function getLatestSnapshot(domain: string): Promise<WaybackSnapshot | null> {
  try {
    const url = `https://${domain}`;
    const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return null;
    }
    
    const data: WaybackResponse = await response.json();
    
    if (data.archived_snapshots?.closest?.available) {
      const closest = data.archived_snapshots.closest;
      return {
        timestamp: closest.timestamp,
        url: closest.url,
        status: closest.status
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Wayback] Error fetching latest snapshot:', error);
    return null;
  }
}
