/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Post_authorId_fkey` ON `post`;

-- AlterTable
ALTER TABLE `post` ADD COLUMN `commentsDepth` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `contentType` ENUM('Text', 'Image', 'Video') NOT NULL DEFAULT 'Text';

-- AlterTable
ALTER TABLE `subeddit` ADD COLUMN `ownerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isSuperAdmin` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `postId` INTEGER NOT NULL,
    `parentId` VARCHAR(191) NULL,

    INDEX `Comment_postId_authorId_parentId_idx`(`postId`, `authorId`, `parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vote` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `postId` INTEGER NULL,
    `commentId` VARCHAR(191) NULL,
    `voteType` TINYINT NOT NULL,
    `voteableType` ENUM('Post', 'Comment') NOT NULL,

    INDEX `Vote_authorId_postId_idx`(`authorId`, `postId`),
    UNIQUE INDEX `Vote_authorId_postId_key`(`authorId`, `postId`),
    UNIQUE INDEX `Vote_authorId_commentId_key`(`authorId`, `commentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SubedditToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SubedditToUser_AB_unique`(`A`, `B`),
    INDEX `_SubedditToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Subeddit_ownerId_idx` ON `Subeddit`(`ownerId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_name_key` ON `User`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `User_name_idx` ON `User`(`name`);
