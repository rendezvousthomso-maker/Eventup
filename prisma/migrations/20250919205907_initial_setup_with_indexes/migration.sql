-- CreateEnum
CREATE TYPE "public"."event_category" AS ENUM ('Pet Meet', 'Games Night', 'Recreation');

-- CreateEnum
CREATE TYPE "public"."booking_status" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(255),
    "scope" VARCHAR(255),
    "id_token" TEXT,
    "session_state" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "sessionToken" VARCHAR(255) NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "image" TEXT,
    "emailVerified" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "token" VARCHAR(255) NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."event_category" NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME(6) NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "host_name" TEXT NOT NULL,
    "host_whatsapp" TEXT NOT NULL,
    "host_id" UUID NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "number_of_people" INTEGER NOT NULL,
    "status" "public"."booking_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_images" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "is_primary" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "public"."accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_sessionToken_idx" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "public"."sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_events_category" ON "public"."events"("category");

-- CreateIndex
CREATE INDEX "idx_events_created_at" ON "public"."events"("created_at");

-- CreateIndex
CREATE INDEX "idx_events_date" ON "public"."events"("date");

-- CreateIndex
CREATE INDEX "idx_events_host_id" ON "public"."events"("host_id");

-- CreateIndex
CREATE INDEX "idx_events_location" ON "public"."events"("location");

-- CreateIndex
CREATE INDEX "idx_events_date_category" ON "public"."events"("date", "category");

-- CreateIndex
CREATE INDEX "idx_events_category_date" ON "public"."events"("category", "date");

-- CreateIndex
CREATE INDEX "idx_events_host_date" ON "public"."events"("host_id", "date");

-- CreateIndex
CREATE INDEX "idx_bookings_created_at" ON "public"."bookings"("created_at");

-- CreateIndex
CREATE INDEX "idx_bookings_event_id" ON "public"."bookings"("event_id");

-- CreateIndex
CREATE INDEX "idx_bookings_status" ON "public"."bookings"("status");

-- CreateIndex
CREATE INDEX "idx_bookings_user_id" ON "public"."bookings"("user_id");

-- CreateIndex
CREATE INDEX "idx_bookings_event_status" ON "public"."bookings"("event_id", "status");

-- CreateIndex
CREATE INDEX "idx_bookings_user_created" ON "public"."bookings"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_bookings_status_created" ON "public"."bookings"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_event_id_user_id_key" ON "public"."bookings"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_event_images_event_id" ON "public"."event_images"("event_id");

-- CreateIndex
CREATE INDEX "idx_event_images_is_primary" ON "public"."event_images"("is_primary");

-- CreateIndex
CREATE INDEX "idx_event_images_user_id" ON "public"."event_images"("user_id");

-- CreateIndex
CREATE INDEX "idx_event_images_event_primary" ON "public"."event_images"("event_id", "is_primary");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_images" ADD CONSTRAINT "event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."event_images" ADD CONSTRAINT "event_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
