CREATE TABLE "api_credentials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"credentials" jsonb NOT NULL,
	"is_active" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"isbn" text NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"thumbnail" text,
	"amazon_price" numeric(10, 2),
	"ebay_price" numeric(10, 2),
	"your_cost" numeric(10, 2),
	"profit" numeric(10, 2),
	"status" text NOT NULL,
	"scanned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"book_id" varchar NOT NULL,
	"listing_id" varchar,
	"sku" text,
	"purchase_date" timestamp NOT NULL,
	"purchase_cost" numeric(10, 2) NOT NULL,
	"purchase_source" text,
	"condition" text NOT NULL,
	"location" text,
	"sold_date" timestamp,
	"sale_price" numeric(10, 2),
	"sold_platform" text,
	"actual_profit" numeric(10, 2),
	"status" text DEFAULT 'in_stock' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"book_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"platform_listing_id" text,
	"price" numeric(10, 2) NOT NULL,
	"condition" text NOT NULL,
	"description" text,
	"quantity" text DEFAULT '1' NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"listed_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"subscription_tier" text DEFAULT 'trial' NOT NULL,
	"subscription_status" text DEFAULT 'active' NOT NULL,
	"subscription_expires_at" timestamp,
	"trial_started_at" timestamp,
	"trial_ends_at" timestamp,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "api_credentials" ADD CONSTRAINT "api_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_credentials_user_id_idx" ON "api_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_credentials_platform_idx" ON "api_credentials" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "books_user_id_idx" ON "books" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "books_isbn_idx" ON "books" USING btree ("isbn");--> statement-breakpoint
CREATE INDEX "inventory_items_user_id_idx" ON "inventory_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inventory_items_book_id_idx" ON "inventory_items" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "inventory_items_status_idx" ON "inventory_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inventory_items_listing_id_idx" ON "inventory_items" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listings_user_id_idx" ON "listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listings_book_id_idx" ON "listings" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "listings_platform_idx" ON "listings" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "listings_status_idx" ON "listings" USING btree ("status");