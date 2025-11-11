ALTER TABLE `scans` ADD `scanWhois` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `scans` ADD `scanDns` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `scans` ADD `scanSubdomains` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `scans` ADD `scanPorts` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `scans` ADD `scanTechnologies` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `scans` ADD `scanDirectories` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `scans` ADD `scanSsl` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `scans` ADD `scanHistorical` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `scans` ADD `scanWayback` boolean DEFAULT true NOT NULL;