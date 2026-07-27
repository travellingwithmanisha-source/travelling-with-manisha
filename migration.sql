-- =============================================================================
-- Travelling with Manisha — Initial Migration
-- Phase 2: Database Migration
--
-- This file has two parts, clearly delimited:
--   PART 1 — Prisma-equivalent DDL (enums, tables, indexes, foreign keys)
--            generated deterministically from prisma/schema.prisma.
--   PART 2 — Hand-written raw SQL for constraints/indexes Prisma's schema
--            language cannot express (CHECK constraints, GIN index, and a
--            small number of partial indexes).
--
-- See MIGRATION_NOTES.md for a full statement-by-statement explanation,
-- provenance (Prisma-generated vs hand-written), and rollback guidance.
-- =============================================================================


-- #############################################################################
-- PART 1 — PRISMA-EQUIVALENT DDL
-- #############################################################################

-- CreateEnum
CREATE TYPE "role" AS ENUM ('TRAVELER', 'HOMESTAY_OWNER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "homestay_status" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "tour_package_status" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "blog_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "booking_type" AS ENUM ('HOMESTAY', 'TOUR_PACKAGE');

-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('PENDING', 'AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "payment_gateway" AS ENUM ('STRIPE', 'RAZORPAY');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "refund_status" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "availability_status" AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "target_type" AS ENUM ('HOMESTAY', 'TOUR_PACKAGE');

-- CreateEnum
CREATE TYPE "coupon_type" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "coupon_applies_to" AS ENUM ('ALL', 'HOMESTAY', 'TOUR_PACKAGE');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'REFUND_PROCESSED', 'REVIEW_RECEIVED', 'OWNER_RESPONSE', 'SYSTEM', 'PROMOTIONAL');

-- CreateEnum
CREATE TYPE "homestay_staff_role" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "supabase_id" UUID,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "role" NOT NULL DEFAULT 'TRAVELER',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "consent_updated_at" TIMESTAMP(3),
    "anonymized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" TEXT,
    "business_registration_no" TEXT,
    "payout_method" TEXT,
    "payout_provider_account_id" TEXT,
    "payout_details" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homestay_staff" (
    "id" UUID NOT NULL,
    "homestay_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "homestay_staff_role" NOT NULL DEFAULT 'STAFF',
    "invited_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homestay_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "cover_image_url" TEXT,
    "images" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_translations" (
    "id" UUID NOT NULL,
    "destination_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "destination_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homestays" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "destination_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "amenities" TEXT[],
    "house_rules" TEXT[],
    "check_in_time" TEXT NOT NULL,
    "check_out_time" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "images" TEXT[],
    "status" "homestay_status" NOT NULL DEFAULT 'DRAFT',
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "starting_price" DECIMAL(10,2),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "homestays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homestay_translations" (
    "id" UUID NOT NULL,
    "homestay_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "homestay_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "homestay_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "room_type" TEXT NOT NULL,
    "max_occupancy" INTEGER NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "total_units" INTEGER NOT NULL DEFAULT 1,
    "amenities" TEXT[],
    "images" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_calendar" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "availability_status" NOT NULL DEFAULT 'AVAILABLE',
    "available_units" INTEGER NOT NULL,
    "price_override" DECIMAL(10,2),
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_packages" (
    "id" UUID NOT NULL,
    "destination_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "duration_days" INTEGER NOT NULL,
    "duration_nights" INTEGER NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "max_group_size" INTEGER NOT NULL,
    "inclusions" TEXT[],
    "exclusions" TEXT[],
    "cover_image_url" TEXT,
    "images" TEXT[],
    "status" "tour_package_status" NOT NULL DEFAULT 'DRAFT',
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tour_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_package_translations" (
    "id" UUID NOT NULL,
    "tour_package_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "tour_package_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" UUID NOT NULL,
    "tour_package_id" UUID NOT NULL,
    "day_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activities" TEXT[],
    "meals" TEXT[],
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "booking_number" TEXT NOT NULL,
    "type" "booking_type" NOT NULL,
    "user_id" UUID NOT NULL,
    "homestay_id" UUID,
    "room_id" UUID,
    "tour_package_id" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "number_of_guests" INTEGER NOT NULL,
    "number_of_units" INTEGER NOT NULL DEFAULT 1,
    "status" "booking_status" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "coupon_id" UUID,
    "special_requests" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "gateway" "payment_gateway" NOT NULL,
    "gateway_payment_id" TEXT,
    "gateway_order_id" TEXT,
    "idempotency_key" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "receipt_url" TEXT,
    "failure_reason" TEXT,
    "refunded_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "gateway_metadata" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "processed_by_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "status" "refund_status" NOT NULL DEFAULT 'REQUESTED',
    "gateway_refund_id" TEXT,
    "gateway_metadata" JSONB,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_type" "target_type" NOT NULL,
    "homestay_id" UUID,
    "tour_package_id" UUID,
    "booking_id" UUID,
    "rating" SMALLINT NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "images" TEXT[],
    "is_verified_stay" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "owner_response" TEXT,
    "owner_responded_at" TIMESTAMP(3),
    "sentiment_score" DECIMAL(4,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_type" "target_type" NOT NULL,
    "homestay_id" UUID,
    "tour_package_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "coupon_type" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "max_discount_amount" DECIMAL(10,2),
    "min_booking_amount" DECIMAL(10,2),
    "applies_to" "coupon_applies_to" NOT NULL DEFAULT 'ALL',
    "homestay_id" UUID,
    "tour_package_id" UUID,
    "usage_limit" INTEGER,
    "usage_limit_per_user" INTEGER DEFAULT 1,
    "times_used" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "related_entity_type" TEXT,
    "related_entity_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "tags" TEXT[],
    "status" "blog_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_translations" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,

    CONSTRAINT "blog_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "changes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "owner_profiles_user_id_key" ON "owner_profiles"("user_id");

-- CreateIndex
CREATE INDEX "homestay_staff_user_id_idx" ON "homestay_staff"("user_id");

-- CreateIndex
CREATE INDEX "homestay_staff_invited_by_id_idx" ON "homestay_staff"("invited_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "homestay_staff_homestay_id_user_id_key" ON "homestay_staff"("homestay_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "destinations_country_state_city_idx" ON "destinations"("country", "state", "city");

-- CreateIndex
CREATE INDEX "destinations_is_active_deleted_at_idx" ON "destinations"("is_active", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "destination_translations_destination_id_locale_key" ON "destination_translations"("destination_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "homestays_slug_key" ON "homestays"("slug");

-- CreateIndex
CREATE INDEX "homestays_owner_id_idx" ON "homestays"("owner_id");

-- CreateIndex
CREATE INDEX "homestays_destination_id_status_deleted_at_idx" ON "homestays"("destination_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "homestays_status_idx" ON "homestays"("status");

-- CreateIndex
CREATE INDEX "homestays_deleted_at_idx" ON "homestays"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "homestay_translations_homestay_id_locale_key" ON "homestay_translations"("homestay_id", "locale");

-- CreateIndex
CREATE INDEX "rooms_homestay_id_is_active_idx" ON "rooms"("homestay_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "availability_calendar_room_id_date_key" ON "availability_calendar"("room_id", "date");

-- CreateIndex
CREATE INDEX "availability_calendar_date_status_idx" ON "availability_calendar"("date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tour_packages_slug_key" ON "tour_packages"("slug");

-- CreateIndex
CREATE INDEX "tour_packages_destination_id_status_deleted_at_idx" ON "tour_packages"("destination_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "tour_packages_status_idx" ON "tour_packages"("status");

-- CreateIndex
CREATE INDEX "tour_packages_created_by_id_idx" ON "tour_packages"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "tour_package_translations_tour_package_id_locale_key" ON "tour_package_translations"("tour_package_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "itineraries_tour_package_id_day_number_key" ON "itineraries"("tour_package_id", "day_number");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "bookings"("booking_number");

-- CreateIndex
CREATE INDEX "bookings_user_id_status_idx" ON "bookings"("user_id", "status");

-- CreateIndex
CREATE INDEX "bookings_homestay_id_status_idx" ON "bookings"("homestay_id", "status");

-- CreateIndex
CREATE INDEX "bookings_tour_package_id_status_idx" ON "bookings"("tour_package_id", "status");

-- CreateIndex
CREATE INDEX "bookings_room_id_start_date_end_date_idx" ON "bookings"("room_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "bookings_coupon_id_idx" ON "bookings"("coupon_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gateway_payment_id_key" ON "payments"("gateway_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_gateway_order_id_idx" ON "payments"("gateway_order_id");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_gateway_refund_id_key" ON "refunds"("gateway_refund_id");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE INDEX "refunds_booking_id_idx" ON "refunds"("booking_id");

-- CreateIndex
CREATE INDEX "refunds_requested_by_id_idx" ON "refunds"("requested_by_id");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_homestay_id_is_approved_idx" ON "reviews"("homestay_id", "is_approved");

-- CreateIndex
CREATE INDEX "reviews_tour_package_id_is_approved_idx" ON "reviews"("tour_package_id", "is_approved");

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_idx" ON "wishlist_items"("user_id");

-- CreateIndex
CREATE INDEX "wishlist_items_homestay_id_idx" ON "wishlist_items"("homestay_id");

-- CreateIndex
CREATE INDEX "wishlist_items_tour_package_id_idx" ON "wishlist_items"("tour_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_user_id_homestay_id_key" ON "wishlist_items"("user_id", "homestay_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_user_id_tour_package_id_key" ON "wishlist_items"("user_id", "tour_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_is_active_valid_from_valid_until_idx" ON "coupons"("is_active", "valid_from", "valid_until");

-- CreateIndex
CREATE INDEX "coupons_created_by_id_idx" ON "coupons"("created_by_id");

-- CreateIndex
CREATE INDEX "coupons_homestay_id_idx" ON "coupons"("homestay_id");

-- CreateIndex
CREATE INDEX "coupons_tour_package_id_idx" ON "coupons"("tour_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_usages_booking_id_key" ON "coupon_usages"("booking_id");

-- CreateIndex
CREATE INDEX "coupon_usages_coupon_id_user_id_idx" ON "coupon_usages"("coupon_id", "user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_author_id_idx" ON "blogs"("author_id");

-- CreateIndex
CREATE INDEX "blogs_status_deleted_at_idx" ON "blogs"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "blogs_published_at_idx" ON "blogs"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_translations_blog_id_locale_key" ON "blog_translations"("blog_id", "locale");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "owner_profiles" ADD CONSTRAINT "owner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homestay_staff" ADD CONSTRAINT "homestay_staff_homestay_id_fkey" FOREIGN KEY ("homestay_id") REFERENCES "homestays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homestay_staff" ADD CONSTRAINT "homestay_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homestay_staff" ADD CONSTRAINT "homestay_staff_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_translations" ADD CONSTRAINT "destination_translations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homestays" ADD CONSTRAINT "homestays_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homestays" ADD CONSTRAINT "homestays_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homestay_translations" ADD CONSTRAINT "homestay_translations_homestay_id_fkey" FOREIGN KEY ("homestay_id") REFERENCES "homestays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_homestay_id_fkey" FOREIGN KEY ("homestay_id") REFERENCES "homestays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_calendar" ADD CONSTRAINT "availability_calendar_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_packages" ADD CONSTRAINT "tour_packages_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_packages" ADD CONSTRAINT "tour_packages_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_package_translations" ADD CONSTRAINT "tour_package_translations_tour_package_id_fkey" FOREIGN KEY ("tour_package_id") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_tour_package_id_fkey" FOREIGN KEY ("tour_package_id") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_homestay_id_fkey" FOREIGN KEY ("homestay_id") REFERENCES "homestays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_package_id_fkey" FOREIGN KEY ("tour_package_id") REFERENCES "tour_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_homestay_id_fkey" FOREIGN KEY ("homestay_id") REFERENCES "homestays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tour_package_id_fkey" FOREIGN KEY ("tour_package_id") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_homestay_id_fkey" FOREIGN KEY ("homestay_id") REFERENCES "homestays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_tour_package_id_fkey" FOREIGN KEY ("tour_package_id") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_homestay_id_fkey" FOREIGN KEY ("homestay_id") REFERENCES "homestays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_tour_package_id_fkey" FOREIGN KEY ("tour_package_id") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_translations" ADD CONSTRAINT "blog_translations_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- #############################################################################
-- PART 2 — HAND-WRITTEN RAW SQL
-- Not expressible in prisma/schema.prisma. Each block is idempotent
-- (guarded so a re-run does not error) even though Prisma's own migration
-- tracking already guarantees this file runs at most once per database.
-- See MIGRATION_NOTES.md for the full rationale behind every statement below.
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 2.1  CHECK — exactly one of (homestay_id / tour_package_id) on Booking,
--      tied to the `type` discriminator for a stronger guarantee than a bare
--      "exactly one of two columns" check would give.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_target_matches_type_check'
  ) THEN
    ALTER TABLE "bookings" ADD CONSTRAINT "bookings_target_matches_type_check" CHECK (
      ("type" = 'HOMESTAY' AND "homestay_id" IS NOT NULL AND "tour_package_id" IS NULL)
      OR
      ("type" = 'TOUR_PACKAGE' AND "tour_package_id" IS NOT NULL AND "homestay_id" IS NULL)
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2.2  CHECK — exactly one of (homestay_id / tour_package_id) on Review,
--      tied to `target_type`.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_target_matches_type_check'
  ) THEN
    ALTER TABLE "reviews" ADD CONSTRAINT "reviews_target_matches_type_check" CHECK (
      ("target_type" = 'HOMESTAY' AND "homestay_id" IS NOT NULL AND "tour_package_id" IS NULL)
      OR
      ("target_type" = 'TOUR_PACKAGE' AND "tour_package_id" IS NOT NULL AND "homestay_id" IS NULL)
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2.3  CHECK — exactly one of (homestay_id / tour_package_id) on WishlistItem,
--      tied to `target_type`.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_items_target_matches_type_check'
  ) THEN
    ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_target_matches_type_check" CHECK (
      ("target_type" = 'HOMESTAY' AND "homestay_id" IS NOT NULL AND "tour_package_id" IS NULL)
      OR
      ("target_type" = 'TOUR_PACKAGE' AND "tour_package_id" IS NOT NULL AND "homestay_id" IS NULL)
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2.4  CHECK — Coupon scoping is "at most one" of (homestay_id /
--      tour_package_id), NOT "exactly one": Coupon has no target_type
--      discriminator because both columns being NULL is a valid, common
--      state (an unscoped, platform-wide coupon under appliesTo = ALL).
--      What must never happen is a coupon scoped to a specific homestay
--      AND a specific tour package simultaneously.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'coupons_scope_at_most_one_check'
  ) THEN
    ALTER TABLE "coupons" ADD CONSTRAINT "coupons_scope_at_most_one_check" CHECK (
      NOT ("homestay_id" IS NOT NULL AND "tour_package_id" IS NOT NULL)
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2.5  CHECK — Payment.refunded_amount must stay within [0, amount].
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_refunded_amount_bounds_check'
  ) THEN
    ALTER TABLE "payments" ADD CONSTRAINT "payments_refunded_amount_bounds_check" CHECK (
      "refunded_amount" >= 0 AND "refunded_amount" <= "amount"
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2.6  CHECK — Review.rating must be within 1..5.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rating_range_check'
  ) THEN
    ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_range_check" CHECK (
      "rating" >= 1 AND "rating" <= 5
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2.7  GIN index — Blog.tags array-containment search (`tags @> ARRAY[...]`).
--      Standard GIN with the default array operator class; no extension
--      required (unlike a trigram or vector index).
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "blogs_tags_gin_idx" ON "blogs" USING GIN ("tags");

-- -----------------------------------------------------------------------------
-- 2.8  Partial indexes — narrower and faster than their full-table
--      equivalents for the single hottest predicate each table serves.
--      Not requested individually but fall under "additional indexes that
--      require raw SQL", since Prisma's schema language has no WHERE clause
--      for @@index.
-- -----------------------------------------------------------------------------

-- Public search/listing almost always filters to exactly this predicate;
-- indexing only those rows keeps the index a fraction of the table size.
CREATE INDEX IF NOT EXISTS "homestays_published_by_destination_idx"
  ON "homestays" ("destination_id")
  WHERE "status" = 'PUBLISHED' AND "deleted_at" IS NULL;

-- Same pattern for tour packages.
CREATE INDEX IF NOT EXISTS "tour_packages_published_by_destination_idx"
  ON "tour_packages" ("destination_id")
  WHERE "status" = 'PUBLISHED' AND "deleted_at" IS NULL;

-- Unread-notification badge/list is the single most frequent notification
-- query and only ever touches the (typically small) unread subset.
CREATE INDEX IF NOT EXISTS "notifications_unread_idx"
  ON "notifications" ("user_id", "created_at")
  WHERE "is_read" = false;

-- Ops/owner dashboards ("today's check-ins", "upcoming stays") only ever
-- care about bookings that are still active, not the full historical set.
CREATE INDEX IF NOT EXISTS "bookings_active_upcoming_idx"
  ON "bookings" ("start_date")
  WHERE "status" IN ('PENDING', 'AWAITING_PAYMENT', 'CONFIRMED') AND "deleted_at" IS NULL;
