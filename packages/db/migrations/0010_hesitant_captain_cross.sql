CREATE TABLE IF NOT EXISTS "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"series" text,
	"model" text NOT NULL,
	"code" text,
	"image" text,
	"colors" jsonb,
	"specs" text,
	"chipset" text,
	"specifications" jsonb,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_device_compatibility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "devices_tenant_idx" ON "devices" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pd_comp_product_idx" ON "product_device_compatibility" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pd_comp_device_idx" ON "product_device_compatibility" ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pd_comp_tenant_idx" ON "product_device_compatibility" ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pd_comp_unique_product_device" ON "product_device_compatibility" ("product_id","device_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "devices" ADD CONSTRAINT "devices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_device_compatibility" ADD CONSTRAINT "product_device_compatibility_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_device_compatibility" ADD CONSTRAINT "product_device_compatibility_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_device_compatibility" ADD CONSTRAINT "product_device_compatibility_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
