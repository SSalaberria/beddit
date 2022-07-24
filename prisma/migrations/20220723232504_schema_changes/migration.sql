/*
  Warnings:

  - You are about to drop the `example` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subedditId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `post` ADD COLUMN `subedditId` VARCHAR(191) NOT NULL,
    MODIFY `title` VARCHAR(255) NOT NULL,
    MODIFY `content` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `example`;

-- CreateTable
CREATE TABLE `Subeddit` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Subeddit_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_subedditId_fkey` FOREIGN KEY (`subedditId`) REFERENCES `Subeddit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
