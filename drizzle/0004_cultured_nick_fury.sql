CREATE TABLE `waybackSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`timestamp` varchar(20) NOT NULL,
	`url` varchar(500) NOT NULL,
	`status` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waybackSnapshots_id` PRIMARY KEY(`id`)
);
