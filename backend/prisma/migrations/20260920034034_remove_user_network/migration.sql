/*
  Warnings:

  - You are about to drop the column `network_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_network_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "network_id";
