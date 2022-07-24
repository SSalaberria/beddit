-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_subedditId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_userId_fkey`;

-- CreateIndex
CREATE INDEX `Account_userId_providerAccountId_idx` ON `Account`(`userId`, `providerAccountId`);

-- CreateIndex
CREATE INDEX `Post_subedditId_authorId_idx` ON `Post`(`subedditId`, `authorId`);

-- RenameIndex
ALTER TABLE `session` RENAME INDEX `Session_userId_fkey` TO `Session_userId_idx`;
