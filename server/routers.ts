import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as reconService from "./reconService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  apiKeys: router({
    // Get user's API keys
    get: protectedProcedure
      .query(async ({ ctx }) => {
        const keys = await db.getUserApiKeys(ctx.user.id);
        return keys || null;
      }),

    // Update user's API keys
    update: protectedProcedure
      .input(z.object({
        shodanApiKey: z.string().optional(),
        securityTrailsApiKey: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserApiKeys({
          userId: ctx.user.id,
          shodanApiKey: input.shodanApiKey || null,
          securityTrailsApiKey: input.securityTrailsApiKey || null
        });
        return { success: true };
      }),

    // Test Shodan API key
    testShodan: protectedProcedure
      .input(z.object({
        apiKey: z.string()
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await fetch(`https://api.shodan.io/api-info?key=${input.apiKey}`);
          if (!response.ok) {
            if (response.status === 401) {
              return { valid: false, error: 'Invalid API key' };
            }
            return { valid: false, error: `HTTP ${response.status}` };
          }
          const data = await response.json();
          return { 
            valid: true, 
            info: `Plan: ${data.plan || 'Free'} | Query Credits: ${data.query_credits || 0}` 
          };
        } catch (error) {
          return { valid: false, error: 'Connection failed' };
        }
      }),

    // Test SecurityTrails API key
    testSecurityTrails: protectedProcedure
      .input(z.object({
        apiKey: z.string()
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await fetch('https://api.securitytrails.com/v1/ping', {
            headers: {
              'APIKEY': input.apiKey,
              'Accept': 'application/json'
            }
          });
          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              return { valid: false, error: 'Invalid API key' };
            }
            if (response.status === 429) {
              return { 
                valid: false, 
                error: 'Rate limit exceeded - Free plan: 50 calls/month. Wait or upgrade plan.' 
              };
            }
            return { valid: false, error: `HTTP ${response.status}` };
          }
          const data = await response.json();
          return { 
            valid: true, 
            info: data.message || 'API key is valid' 
          };
        } catch (error) {
          return { valid: false, error: 'Connection failed' };
        }
      }),
  }),

  scan: router({
    // Create a new scan
    create: protectedProcedure
      .input(z.object({
        domain: z.string().min(1)
      }))
      .mutation(async ({ ctx, input }) => {
        const scan = await db.createScan({
          userId: ctx.user.id,
          domain: input.domain,
          status: 'pending',
          progress: 0
        });

        // Start the scan asynchronously
        reconService.performFullScan(scan.id, input.domain, ctx.user.id).catch(err => {
          console.error('Scan error:', err);
        });

        return scan;
      }),

    // Get scan by ID
    getById: protectedProcedure
      .input(z.object({
        id: z.number()
      }))
      .query(async ({ input }) => {
        return await db.getScanById(input.id);
      }),

    // Get user's scans
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserScans(ctx.user.id);
      }),

    // Delete scan
    delete: protectedProcedure
      .input(z.object({
        scanId: z.number()
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership
        const scan = await db.getScanById(input.scanId);
        if (!scan || scan.userId !== ctx.user.id) {
          throw new Error('Scan not found or unauthorized');
        }
        
        await db.deleteScan(input.scanId);
        return { success: true };
      }),

    // Get scan results
    getResults: protectedProcedure
      .input(z.object({
        scanId: z.number()
      }))
      .query(async ({ input }) => {
        const [
          scan,
          subdomains,
          ports,
          technologies,
          dnsRecords,
          whoisInfo,
          sslCertificate,
          vulnerabilities,
          historicalDns,
          historicalWhois,
          historicalIps,
          waybackSnapshots
        ] = await Promise.all([
          db.getScanById(input.scanId),
          db.getScanSubdomains(input.scanId),
          db.getScanPorts(input.scanId),
          db.getScanTechnologies(input.scanId),
          db.getScanDnsRecords(input.scanId),
          db.getScanWhoisInfo(input.scanId),
          db.getScanSslCertificate(input.scanId),
          db.getScanVulnerabilities(input.scanId),
          db.getScanHistoricalDns(input.scanId),
          db.getScanHistoricalWhois(input.scanId),
          db.getScanHistoricalIps(input.scanId),
          db.getScanWaybackSnapshots(input.scanId)
        ]);

        return {
          scan,
          subdomains,
          ports,
          technologies,
          dnsRecords,
          whoisInfo,
          sslCertificate,
          vulnerabilities,
          historicalDns,
          historicalWhois,
          historicalIps,
          waybackSnapshots
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
