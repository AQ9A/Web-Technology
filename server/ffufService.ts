import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

const WORDLIST_PATH = '/home/ubuntu/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt';
const SENSITIVE_PATTERNS = [
  '.bak', '.old', '.sql', '.zip', '.tar', '.gz',
  '.env', 'config', 'backup', 'admin', 'dashboard',
  '.git', '.svn', 'phpinfo', 'test', 'debug'
];

interface FfufResult {
  input: {
    FUZZ: string;
  };
  position: number;
  status: number;
  length: number;
  words: number;
  lines: number;
  content_type: string;
  redirectlocation: string;
  duration: number;
  resultfile: string;
  url: string;
  host: string;
}

interface FfufOutput {
  results: FfufResult[];
  config: any;
  commandline: string;
  time: string;
}

export interface DirectoryResult {
  path: string;
  statusCode: number;
  contentLength: number;
  responseTime: number;
  isSensitive: boolean;
}

/**
 * Check if a path contains sensitive patterns
 */
function isSensitivePath(path: string): boolean {
  const lowerPath = path.toLowerCase();
  return SENSITIVE_PATTERNS.some(pattern => lowerPath.includes(pattern));
}

/**
 * Run ffuf directory fuzzing on a domain
 * @param domain - Target domain (e.g., example.com)
 * @param protocol - http or https (default: https)
 * @returns Array of discovered directories
 */
export async function runDirectoryFuzzing(
  domain: string,
  protocol: string = 'https'
): Promise<DirectoryResult[]> {
  try {
    // Create temporary output file
    const outputFile = `/tmp/ffuf-${Date.now()}.json`;
    const targetUrl = `${protocol}://${domain}/FUZZ`;

    console.log(`[ffuf] Starting directory fuzzing for ${targetUrl}`);

    // Check if wordlist exists
    try {
      await fs.access(WORDLIST_PATH);
    } catch (error) {
      console.error(`[ffuf] Wordlist not found at ${WORDLIST_PATH}`);
      throw new Error('Wordlist file not found. Please ensure SecLists is installed.');
    }

    // Run ffuf command
    // -mc: Match status codes (200, 301)
    // -t: Threads (40 for reasonable speed)
    // -timeout: Request timeout (10 seconds)
    // -recursion: No recursion
    // -o: Output file
    // -of: Output format (json)
    // -ac: Auto-calibration to filter false positives
    const ffufCommand = `ffuf -u "${targetUrl}" -w "${WORDLIST_PATH}" -mc 200,301 -t 40 -timeout 10 -o "${outputFile}" -of json -ac -s`;

    console.log(`[ffuf] Running command: ${ffufCommand}`);

    try {
      await execAsync(ffufCommand, {
        timeout: 600000, // 10 minutes max
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
    } catch (error: any) {
      // ffuf exits with code 1 when no results found, which is not an error
      if (error.code !== 1) {
        console.error(`[ffuf] Command failed:`, error);
        throw new Error(`ffuf execution failed: ${error.message}`);
      }
    }

    // Read and parse results
    let results: DirectoryResult[] = [];
    
    try {
      const outputData = await fs.readFile(outputFile, 'utf-8');
      const ffufOutput: FfufOutput = JSON.parse(outputData);

      if (ffufOutput.results && ffufOutput.results.length > 0) {
        results = ffufOutput.results.map((result: FfufResult) => ({
          path: `/${result.input.FUZZ}`,
          statusCode: result.status,
          contentLength: result.length,
          responseTime: Math.round(result.duration / 1000000), // Convert nanoseconds to milliseconds
          isSensitive: isSensitivePath(result.input.FUZZ),
        }));

        console.log(`[ffuf] Found ${results.length} directories/files`);
      } else {
        console.log(`[ffuf] No directories found`);
      }
    } catch (error) {
      console.error(`[ffuf] Failed to parse output file:`, error);
    }

    // Clean up temporary file
    try {
      await fs.unlink(outputFile);
    } catch (error) {
      console.warn(`[ffuf] Failed to delete temporary file: ${outputFile}`);
    }

    return results;
  } catch (error) {
    console.error(`[ffuf] Directory fuzzing failed:`, error);
    throw error;
  }
}

/**
 * Test ffuf installation
 */
export async function testFfufInstallation(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('ffuf -V');
    console.log(`[ffuf] Version: ${stdout.trim()}`);
    return true;
  } catch (error) {
    console.error(`[ffuf] Not installed or not in PATH`);
    return false;
  }
}
