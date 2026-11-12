CREATE TYPE "public"."employee_status" AS ENUM('pending', 'active', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."shirt_size" AS ENUM('PP', 'P', 'M', 'G', 'GG', 'XGG');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"user_label" varchar(150) NOT NULL,
	"action" varchar(100) NOT NULL,
	"target" text,
	"input" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_sectors" (
	"employee_id" uuid NOT NULL,
	"sector_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "employee_sectors_employee_id_sector_id_pk" PRIMARY KEY("employee_id","sector_id")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"shift_id" uuid,
	"name" varchar(255) NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"rg" varchar(20),
	"pix_key" varchar(255),
	"address" text,
	"avatar_url" text,
	"status" "employee_status" DEFAULT 'active' NOT NULL,
	"shirt_size" "shirt_size" DEFAULT 'M' NOT NULL,
	"pants_size" varchar(10),
	"shoe_size" integer,
	"uniform" jsonb DEFAULT '{"shirt":false,"pants":false,"shoes":false,"jacket":false}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"reset_token" varchar(64),
	"reset_token_expires" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"role_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"start_time" time,
	"end_time" time,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission" varchar(40) NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_pk" PRIMARY KEY("role_id","permission")
);
--> statement-breakpoint
ALTER TABLE "employee_sectors" ADD CONSTRAINT "employee_sectors_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_sectors" ADD CONSTRAINT "employee_sectors_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_employee_sectors_employee_id" ON "employee_sectors" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_employee_sectors_sector_id" ON "employee_sectors" USING btree ("sector_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_cpf_active_uniq" ON "employees" USING btree ("cpf") WHERE "employees"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "employees_user_id_active_uniq" ON "employees" USING btree ("user_id") WHERE "employees"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "idx_employees_name" ON "employees" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_employees_status" ON "employees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_employees_shift_id" ON "employees" USING btree ("shift_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_active_uniq" ON "roles" USING btree (lower("name")) WHERE "roles"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_active_uniq" ON "users" USING btree (lower("email")) WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "idx_users_role_id" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "sectors_name_active_uniq" ON "sectors" USING btree (lower("name")) WHERE "sectors"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "shifts_name_active_uniq" ON "shifts" USING btree (lower("name")) WHERE "shifts"."deleted_at" is null;