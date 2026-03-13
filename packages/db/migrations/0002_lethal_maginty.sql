CREATE TABLE IF NOT EXISTS "sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid,
	"total_amount" numeric NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_item_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sale_item_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"buy_price" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"sell_price" numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_tenant_idx" ON "sales" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_item_batches_tenant_idx" ON "sales_item_batches" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_item_batches_sale_item_idx" ON "sales_item_batches" ("sale_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_item_batches_batch_idx" ON "sales_item_batches" ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_items_tenant_idx" ON "sales_items" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_items_sale_idx" ON "sales_items" ("sale_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_items_product_idx" ON "sales_items" ("product_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales" ADD CONSTRAINT "sales_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_item_batches" ADD CONSTRAINT "sales_item_batches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_item_batches" ADD CONSTRAINT "sales_item_batches_sale_item_id_sales_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "sales_items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_item_batches" ADD CONSTRAINT "sales_item_batches_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_items" ADD CONSTRAINT "sales_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_items" ADD CONSTRAINT "sales_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_items" ADD CONSTRAINT "sales_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
