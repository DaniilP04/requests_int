-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "phone" TEXT,
    "device_type" TEXT NOT NULL,
    "source" TEXT DEFAULT 'telegram',
    "telegram_id" BIGINT,
    "track_id" TEXT NOT NULL DEFAULT generate_track_id(),
    "status" TEXT DEFAULT 'В обработке',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "status_modified_at" TIMESTAMP(6),
    "deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "requests_track_id_key" ON "requests"("track_id");
