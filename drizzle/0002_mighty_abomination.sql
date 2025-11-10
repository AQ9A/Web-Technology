CREATE TABLE `historicalDns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`recordType` varchar(10) NOT NULL,
	`value` text NOT NULL,
	`firstSeen` varchar(100),
	`lastSeen` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historicalDns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historicalIps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`firstSeen` varchar(100),
	`lastSeen` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historicalIps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historicalWhois` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`registrar` varchar(255),
	`created` varchar(100),
	`expires` varchar(100),
	`updated` varchar(100),
	`nameServers` text,
	`registrantName` varchar(255),
	`registrantOrg` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historicalWhois_id` PRIMARY KEY(`id`)
);
