-- Rename default branches from "Main" to "Original"
UPDATE "RecipeBranch" SET "name" = 'Original' WHERE "name" = 'Main' AND "isDefault" = true;
