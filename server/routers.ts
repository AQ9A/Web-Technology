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
        reconService.performFullScan(scan.id, input.domain).catch(err => {
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
          vulnerabilities
        ] = await Promise.all([
          db.getScanById(input.scanId),
          db.getScanSubdomains(input.scanId),
          db.getScanPorts(input.scanId),
          db.getScanTechnologies(input.scanId),
          db.getScanDnsRecords(input.scanId),
          db.getScanWhoisInfo(input.scanId),
          db.getScanSslCertificate(input.scanId),
          db.getScanVulnerabilities(input.scanId)
        ]);

        return {
          scan,
          subdomains,
          ports,
          technologies,
          dnsRecords,
          whoisInfo,
          sslCertificate,
          vulnerabilities
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
