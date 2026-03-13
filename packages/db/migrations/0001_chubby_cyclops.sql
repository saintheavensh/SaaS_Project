ALTER TABLE "batches" ALTER COLUMN "buy_price" SET DATA TYPE numeric USING "buy_price"::numeric;--> statement-breakpoint
ALTER TABLE "batches" ALTER COLUMN "sell_price" SET DATA TYPE numeric USING "sell_price"::numeric;--> statement-breakpoint
ALTER TABLE "batches" ALTER COLUMN "initial_stock" SET DATA TYPE integer USING "initial_stock"::integer;--> statement-breakpoint
ALTER TABLE "batches" ALTER COLUMN "current_stock" SET DATA TYPE integer USING "current_stock"::integer;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "stock" SET DATA TYPE integer USING "stock"::integer;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "stock" SET DEFAULT 0;