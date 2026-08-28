ALTER TABLE "text" ALTER COLUMN "id" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "text" ALTER COLUMN "id" SET DATA TYPE varchar(36) USING "id"::text;