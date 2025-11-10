import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  scans, 
  Scan, 
  InsertScan,
  subdomains,
  Subdomain,
  InsertSubdomain,
  ports,
  Port,
  InsertPort,
  technologies,
  Technology,
  InsertTechnology,
  dnsRecords,
  DnsRecord,
  InsertDnsRecord,
  whoisInfo,
  WhoisInfo,
  InsertWhoisInfo,
  sslCertificates,
  SslCertificate,
  InsertSslCertificate,
  vulnerabilities,
  Vulnerability,
  InsertVulnerability,
  historicalDns,
  HistoricalDns,
  InsertHistoricalDns,
  historicalWhois,
  HistoricalWhois,
  InsertHistoricalWhois,
  historicalIps,
  HistoricalIp,
  InsertHistoricalIp,
  waybackSnapshots,
  WaybackSnapshot,
  InsertWaybackSnapshot
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Scan operations
export async function createScan(scan: InsertScan): Promise<Scan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scans).values(scan);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(scans).where(eq(scans.id, insertedId)).limit(1);
  return inserted[0];
}

export async function updateScan(id: number, updates: Partial<InsertScan>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(scans).set(updates).where(eq(scans.id, id));
}

export async function getScanById(id: number): Promise<Scan | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(scans).where(eq(scans.id, id)).limit(1);
  return result[0];
}

export async function getUserScans(userId: number): Promise<Scan[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(scans).where(eq(scans.userId, userId)).orderBy(desc(scans.createdAt));
}

// Subdomain operations
export async function createSubdomain(subdomain: InsertSubdomain): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(subdomains).values(subdomain);
}

export async function getScanSubdomains(scanId: number): Promise<Subdomain[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(subdomains).where(eq(subdomains.scanId, scanId));
}

export async function updateSubdomainSource(subdomainId: number, source: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(subdomains)
    .set({ source })
    .where(eq(subdomains.id, subdomainId));
}

// Port operations
export async function createPort(port: InsertPort): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(ports).values(port);
}

export async function getScanPorts(scanId: number): Promise<Port[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(ports).where(eq(ports.scanId, scanId));
}

// Technology operations
export async function createTechnology(technology: InsertTechnology): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(technologies).values(technology);
}

export async function getScanTechnologies(scanId: number): Promise<Technology[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(technologies).where(eq(technologies.scanId, scanId));
}

// DNS Record operations
export async function createDnsRecord(record: InsertDnsRecord): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(dnsRecords).values(record);
}

export async function getScanDnsRecords(scanId: number): Promise<DnsRecord[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(dnsRecords).where(eq(dnsRecords.scanId, scanId));
}

// WHOIS operations
export async function createWhoisInfo(info: InsertWhoisInfo): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(whoisInfo).values(info);
}

export async function getScanWhoisInfo(scanId: number): Promise<WhoisInfo | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(whoisInfo).where(eq(whoisInfo.scanId, scanId)).limit(1);
  return result[0];
}

// SSL Certificate operations
export async function createSslCertificate(cert: InsertSslCertificate): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sslCertificates).values(cert);
}

export async function getScanSslCertificate(scanId: number): Promise<SslCertificate | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(sslCertificates).where(eq(sslCertificates.scanId, scanId)).limit(1);
  return result[0];
}

// Vulnerability operations
export async function createVulnerability(vuln: InsertVulnerability): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(vulnerabilities).values(vuln);
}

export async function getScanVulnerabilities(scanId: number): Promise<Vulnerability[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(vulnerabilities).where(eq(vulnerabilities.scanId, scanId));
}

// Historical DNS operations
export async function createHistoricalDns(record: InsertHistoricalDns): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(historicalDns).values(record);
}

export async function getScanHistoricalDns(scanId: number): Promise<HistoricalDns[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(historicalDns).where(eq(historicalDns.scanId, scanId));
}

// Historical WHOIS operations
export async function createHistoricalWhois(record: InsertHistoricalWhois): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(historicalWhois).values(record);
}

export async function getScanHistoricalWhois(scanId: number): Promise<HistoricalWhois[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(historicalWhois).where(eq(historicalWhois.scanId, scanId));
}

// Historical IP operations
export async function createHistoricalIp(record: InsertHistoricalIp): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(historicalIps).values(record);
}

export async function getScanHistoricalIps(scanId: number): Promise<HistoricalIp[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(historicalIps).where(eq(historicalIps.scanId, scanId));
}

// Delete scan and all related data
export async function deleteScan(scanId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all related data first (foreign key constraints)
  await Promise.all([
    db.delete(subdomains).where(eq(subdomains.scanId, scanId)),
    db.delete(ports).where(eq(ports.scanId, scanId)),
    db.delete(technologies).where(eq(technologies.scanId, scanId)),
    db.delete(dnsRecords).where(eq(dnsRecords.scanId, scanId)),
    db.delete(whoisInfo).where(eq(whoisInfo.scanId, scanId)),
    db.delete(sslCertificates).where(eq(sslCertificates.scanId, scanId)),
    db.delete(vulnerabilities).where(eq(vulnerabilities.scanId, scanId)),
    db.delete(historicalDns).where(eq(historicalDns.scanId, scanId)),
    db.delete(historicalWhois).where(eq(historicalWhois.scanId, scanId)),
    db.delete(historicalIps).where(eq(historicalIps.scanId, scanId)),
  ]);

  // Finally delete the scan itself
  await db.delete(scans).where(eq(scans.id, scanId));
}


// Wayback Snapshots operations
export async function createWaybackSnapshot(snapshot: InsertWaybackSnapshot): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(waybackSnapshots).values(snapshot);
}

export async function getScanWaybackSnapshots(scanId: number): Promise<WaybackSnapshot[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(waybackSnapshots).where(eq(waybackSnapshots.scanId, scanId));
}
