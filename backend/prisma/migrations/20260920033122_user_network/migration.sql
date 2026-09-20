-- Gives every account the one home it may see.
--
-- Prisma generates a single `ADD COLUMN "network_id" INTEGER NOT NULL`, which fails on a table that already
-- has rows. Rewritten by hand into the standard three steps: add the column nullable, backfill it, then make
-- it NOT NULL. The backfill is a data migration, which the Prisma schema language cannot express.
--
-- On a fresh installation migrations run before anyone registers, so `users` is empty and the backfill does
-- nothing. On a database that already has accounts, each is put on the first home. If accounts existed and no
-- home did, the last step fails loudly rather than inventing one - which is the intended behaviour.

-- AlterTable: nullable first, so existing rows survive the addition.
ALTER TABLE "users" ADD COLUMN "network_id" INTEGER;

-- Backfill: accounts created before homes had owners would otherwise have nothing to show.
UPDATE "users"
SET "network_id" = (SELECT "networks"."id" FROM "networks" ORDER BY "networks"."id" LIMIT 1)
WHERE "network_id" IS NULL;

-- Now the column can carry the constraint the schema asks for.
ALTER TABLE "users" ALTER COLUMN "network_id" SET NOT NULL;

-- AddForeignKey: RESTRICT, so a home cannot be deleted while people still live in it.
ALTER TABLE "users" ADD CONSTRAINT "users_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
