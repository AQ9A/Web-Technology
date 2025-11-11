CREATE TABLE `directories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`path` varchar(500) NOT NULL,
	`statusCode` int NOT NULL,
	`contentLength` int,
	`responseTime` int,
	`isSensitive` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `directories_id` PRIMARY KEY(`id`)
);
