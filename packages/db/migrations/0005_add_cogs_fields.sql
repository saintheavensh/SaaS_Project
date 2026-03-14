ALTER TABLE "sales_item_batches" RENAME COLUMN "buy_price" TO "cost_price";
ALTER TABLE "sales_item_batches" ADD COLUMN "sell_price" numeric NOT NULL;
