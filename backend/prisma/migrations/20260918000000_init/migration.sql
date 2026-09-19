-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "user_uuid" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "first_name" VARCHAR(30) NOT NULL,
    "last_name" VARCHAR(30) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_uuid")
);

-- CreateTable
CREATE TABLE "networks" (
    "id" SERIAL NOT NULL,
    "network_id" INTEGER NOT NULL,

    CONSTRAINT "networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "network_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "location_id" INTEGER NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "unit" VARCHAR(10) NOT NULL,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_events" (
    "id" SERIAL NOT NULL,
    "sensor_id" INTEGER NOT NULL,
    "action_id" INTEGER NOT NULL,
    "metric_id" INTEGER,
    "value" DOUBLE PRECISION,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sensor_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "network_id" INTEGER NOT NULL,
    "time" TIMESTAMPTZ(3) NOT NULL,
    "activity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "networks_network_id_key" ON "networks"("network_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_network_id_name_key" ON "locations"("network_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "sensors_name_key" ON "sensors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_name_key" ON "metrics"("name");

-- CreateIndex
CREATE UNIQUE INDEX "actions_name_key" ON "actions"("name");

-- CreateIndex
-- Door events have no metric (metric_id IS NULL). A plain unique index treats NULLs as distinct,
-- so NULLS NOT DISTINCT (Postgres 15+) is added to also de-duplicate those events.
CREATE UNIQUE INDEX "sensor_events_sensor_id_metric_id_occurred_at_key" ON "sensor_events"("sensor_id", "metric_id", "occurred_at") NULLS NOT DISTINCT;

-- CreateIndex
CREATE UNIQUE INDEX "activities_network_id_time_key" ON "activities"("network_id", "time");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_events" ADD CONSTRAINT "sensor_events_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_events" ADD CONSTRAINT "sensor_events_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_events" ADD CONSTRAINT "sensor_events_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A reading is either complete (metric + value) or absent (neither).
ALTER TABLE "sensor_events" ADD CONSTRAINT "sensor_events_metric_value_check" CHECK (("metric_id" IS NULL) = ("value" IS NULL));
