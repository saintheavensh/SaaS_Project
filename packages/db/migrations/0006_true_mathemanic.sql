ALTER TABLE "sales_item_batches" RENAME COLUMN "buy_price" TO "cost_price";--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "revenue" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "cogs" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "gross_profit" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_item_batches" ADD COLUMN "sell_price" numeric NOT NULL;