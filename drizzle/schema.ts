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
