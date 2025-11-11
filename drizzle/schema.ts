import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Scans table - stores each scan operation
 */
export const scans = mysqlTable("scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  progress: int("progress").default(0).notNull(),
  // Scan options - which scans to perform
  scanWhois: boolean("scanWhois").default(true).notNull(),
  scanDns: boolean("scanDns").default(true).notNull(),
  scanSubdomains: boolean("scanSubdomains").default(true).notNull(),
  scanPorts: boolean("scanPorts").default(true).notNull(),
  scanTechnologies: boolean("scanTechnologies").default(true).notNull(),
  scanDirectories: boolean("scanDirectories").default(true).notNull(),
  scanSsl: boolean("scanSsl").default(true).notNull(),
  scanHistorical: boolean("scanHistorical").default(true).notNull(),
  scanWayback: boolean("scanWayback").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;

/**
 * Subdomains table - stores discovered subdomains
 */
export const subdomains = mysqlTable("subdomains", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  subdomain: varchar("subdomain", { length: 255 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  isAlive: boolean("isAlive").default(false),
  statusCode: int("statusCode"),
  source: varchar("source", { length: 50 }), // DNS, SecurityTrails, crt.sh
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subdomain = typeof subdomains.$inferSelect;
export type InsertSubdomain = typeof subdomains.$inferInsert;

/**
 * Ports table - stores open ports discovered
 */
export const ports = mysqlTable("ports", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  host: varchar("host", { length: 255 }).notNull(),
  port: int("port").notNull(),
  service: varchar("service", { length: 100 }),
  version: varchar("version", { length: 255 }),
  state: varchar("state", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Port = typeof ports.$inferSelect;
export type InsertPort = typeof ports.$inferInsert;

/**
 * Technologies table - stores detected technologies
 */
export const technologies = mysqlTable("technologies", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  version: varchar("version", { length: 100 }),
  category: varchar("category", { length: 100 }),
  confidence: int("confidence"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Technology = typeof technologies.$inferSelect;
export type InsertTechnology = typeof technologies.$inferInsert;

/**
 * DNS Records table - stores DNS information
 */
export const dnsRecords = mysqlTable("dnsRecords", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  recordType: varchar("recordType", { length: 10 }).notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DnsRecord = typeof dnsRecords.$inferSelect;
export type InsertDnsRecord = typeof dnsRecords.$inferInsert;

/**
 * WHOIS Information table
 */
export const whoisInfo = mysqlTable("whoisInfo", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  registrar: varchar("registrar", { length: 255 }),
  creationDate: varchar("creationDate", { length: 100 }),
  expirationDate: varchar("expirationDate", { length: 100 }),
  nameServers: text("nameServers"),
  status: text("status"),
  rawData: text("rawData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhoisInfo = typeof whoisInfo.$inferSelect;
export type InsertWhoisInfo = typeof whoisInfo.$inferInsert;

/**
 * SSL Certificate Information table
 */
export const sslCertificates = mysqlTable("sslCertificates", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  issuer: varchar("issuer", { length: 255 }),
  subject: varchar("subject", { length: 255 }),
  validFrom: varchar("validFrom", { length: 100 }),
  validTo: varchar("validTo", { length: 100 }),
  serialNumber: varchar("serialNumber", { length: 255 }),
  signatureAlgorithm: varchar("signatureAlgorithm", { length: 100 }),
  isValid: boolean("isValid").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SslCertificate = typeof sslCertificates.$inferSelect;
export type InsertSslCertificate = typeof sslCertificates.$inferInsert;

/**
 * Vulnerabilities table - stores potential vulnerabilities
 */
export const vulnerabilities = mysqlTable("vulnerabilities", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  description: text("description"),
  recommendation: text("recommendation"),
  affectedUrl: varchar("affectedUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = typeof vulnerabilities.$inferInsert;

/**
 * Historical DNS Records table - stores historical DNS data from SecurityTrails
 */
export const historicalDns = mysqlTable("historicalDns", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  recordType: varchar("recordType", { length: 10 }).notNull(),
  value: text("value").notNull(),
  firstSeen: varchar("firstSeen", { length: 100 }),
  lastSeen: varchar("lastSeen", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricalDns = typeof historicalDns.$inferSelect;
export type InsertHistoricalDns = typeof historicalDns.$inferInsert;

/**
 * Historical WHOIS table - stores historical WHOIS data
 */
export const historicalWhois = mysqlTable("historicalWhois", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  registrar: varchar("registrar", { length: 255 }),
  created: varchar("created", { length: 100 }),
  expires: varchar("expires", { length: 100 }),
  updated: varchar("updated", { length: 100 }),
  nameServers: text("nameServers"),
  registrantName: varchar("registrantName", { length: 255 }),
  registrantOrg: varchar("registrantOrg", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricalWhois = typeof historicalWhois.$inferSelect;
export type InsertHistoricalWhois = typeof historicalWhois.$inferInsert;

/**
 * Historical IPs table - stores historical IP addresses
 */
export const historicalIps = mysqlTable("historicalIps", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  firstSeen: varchar("firstSeen", { length: 100 }),
  lastSeen: varchar("lastSeen", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricalIp = typeof historicalIps.$inferSelect;
export type InsertHistoricalIp = typeof historicalIps.$inferInsert;

/**
 * Wayback Machine Snapshots table - stores historical snapshots from Internet Archive
 */
export const waybackSnapshots = mysqlTable("waybackSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  timestamp: varchar("timestamp", { length: 20 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  status: varchar("status", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaybackSnapshot = typeof waybackSnapshots.$inferSelect;
export type InsertWaybackSnapshot = typeof waybackSnapshots.$inferInsert;

/**
 * Directories table - stores discovered directories and files from fuzzing
 */
export const directories = mysqlTable("directories", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  statusCode: int("statusCode").notNull(),
  contentLength: int("contentLength"),
  responseTime: int("responseTime"), // in milliseconds
  isSensitive: boolean("isSensitive").default(false), // backup, config, admin files
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Directory = typeof directories.$inferSelect;
export type InsertDirectory = typeof directories.$inferInsert;

/**
 * User API Keys table - stores user's API keys for external services
 */
export const userApiKeys = mysqlTable("userApiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // One set of keys per user
  shodanApiKey: varchar("shodanApiKey", { length: 255 }),
  securityTrailsApiKey: varchar("securityTrailsApiKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserApiKeys = typeof userApiKeys.$inferSelect;
export type InsertUserApiKeys = typeof userApiKeys.$inferInsert;
