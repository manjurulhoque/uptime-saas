-- AlterTable
ALTER TABLE "public"."monitors" ADD COLUMN     "alert_email" TEXT,
ADD COLUMN     "alert_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alert_on_down" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alert_on_slow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alert_on_up" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slow_threshold" INTEGER;

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" SERIAL NOT NULL,
    "monitor_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
