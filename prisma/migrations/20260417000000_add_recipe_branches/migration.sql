-- CreateTable
CREATE TABLE "RecipeBranch" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdFromVersionId" TEXT,
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeBranch_pkey" PRIMARY KEY ("id")
);

-- AlterTable: add branchId to RecipeVersion (nullable)
ALTER TABLE "RecipeVersion" ADD COLUMN "branchId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RecipeBranch_currentVersionId_key" ON "RecipeBranch"("currentVersionId");
CREATE UNIQUE INDEX "RecipeBranch_recipeId_name_key" ON "RecipeBranch"("recipeId", "name");

-- AddForeignKey
ALTER TABLE "RecipeBranch" ADD CONSTRAINT "RecipeBranch_recipeId_fkey"
    FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecipeBranch" ADD CONSTRAINT "RecipeBranch_createdFromVersionId_fkey"
    FOREIGN KEY ("createdFromVersionId") REFERENCES "RecipeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecipeBranch" ADD CONSTRAINT "RecipeBranch_currentVersionId_fkey"
    FOREIGN KEY ("currentVersionId") REFERENCES "RecipeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: create a "Main" branch for each existing recipe
INSERT INTO "RecipeBranch" ("id", "recipeId", "name", "isDefault", "order", "currentVersionId", "createdAt")
SELECT
    gen_random_uuid()::text,
    r."id",
    'Main',
    true,
    0,
    r."currentVersionId",
    NOW()
FROM "Recipe" r;

-- Backfill: assign all existing versions to their recipe's Main branch
UPDATE "RecipeVersion" rv
SET "branchId" = b."id"
FROM "RecipeBranch" b
WHERE rv."recipeId" = b."recipeId" AND b."isDefault" = true;

-- AddForeignKey (after backfill so existing rows aren't rejected)
ALTER TABLE "RecipeVersion" ADD CONSTRAINT "RecipeVersion_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "RecipeBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
