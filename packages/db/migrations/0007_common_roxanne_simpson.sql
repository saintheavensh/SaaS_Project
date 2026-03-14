CREATE TABLE IF NOT EXISTS "sales_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entry_date" timestamp NOT NULL,
	"total_revenue" numeric DEFAULT '0' NOT NULL,
	"total_cogs" numeric DEFAULT '0' NOT NULL,
	"total_gross_profit" numeric DEFAULT '0' NOT NULL,
	"sales_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_summary_tenant_date_idx" ON "sales_summaries" ("tenant_id","entry_date");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_summaries" ADD CONSTRAINT "sales_summaries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
