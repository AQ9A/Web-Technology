CREATE TABLE `dnsRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`recordType` varchar(10) NOT NULL,
	`value` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dnsRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`host` varchar(255) NOT NULL,
	`port` int NOT NULL,
	`service` varchar(100),
	`version` varchar(255),
	`state` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`progress` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sslCertificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`issuer` varchar(255),
	`subject` varchar(255),
	`validFrom` varchar(100),
	`validTo` varchar(100),
	`serialNumber` varchar(255),
	`signatureAlgorithm` varchar(100),
	`isValid` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sslCertificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subdomains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`subdomain` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`isAlive` boolean DEFAULT false,
	`statusCode` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subdomains_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technologies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`version` varchar(100),
	`category` varchar(100),
	`confidence` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `technologies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vulnerabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text,
	`recommendation` text,
	`affectedUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vulnerabilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whoisInfo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`registrar` varchar(255),
	`creationDate` varchar(100),
	`expirationDate` varchar(100),
	`nameServers` text,
	`status` text,
	`rawData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whoisInfo_id` PRIMARY KEY(`id`)
);
