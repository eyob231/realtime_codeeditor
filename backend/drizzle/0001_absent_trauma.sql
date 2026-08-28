ALTER TABLE "text" ALTER COLUMN "text" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "text" ALTER COLUMN "text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "text" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;