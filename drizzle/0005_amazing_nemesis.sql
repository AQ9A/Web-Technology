CREATE TABLE `userApiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shodanApiKey` varchar(255),
	`securityTrailsApiKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userApiKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `userApiKeys_userId_unique` UNIQUE(`userId`)
);
