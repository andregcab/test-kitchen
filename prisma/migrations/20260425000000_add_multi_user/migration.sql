-- Add username to User
ALTER TABLE "User" ADD COLUMN "username" TEXT;
UPDATE "User" SET "username" = 'admin' WHERE "username" IS NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Add userId to Recipe
ALTER TABLE "Recipe" ADD COLUMN "userId" TEXT;
UPDATE "Recipe" SET "userId" = (SELECT id FROM "User" LIMIT 1);
ALTER TABLE "Recipe" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add userId to Menu
ALTER TABLE "Menu" ADD COLUMN "userId" TEXT;
UPDATE "Menu" SET "userId" = (SELECT id FROM "User" LIMIT 1);
ALTER TABLE "Menu" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
