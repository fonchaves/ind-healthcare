-- CreateTable
CREATE TABLE "srag_cases" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "notification_date" TIMESTAMP(3) NOT NULL,
    "week_number" INTEGER,
    "state" TEXT NOT NULL,
    "state_residence" TEXT,
    "municipality" TEXT,
    "municipality_res" TEXT,
    "sex" TEXT,
    "age_years" INTEGER,
    "age_type" INTEGER,
    "hospitalized" BOOLEAN NOT NULL DEFAULT false,
    "hospital_date" TIMESTAMP(3),
    "icu" BOOLEAN NOT NULL DEFAULT false,
    "icu_entry_date" TIMESTAMP(3),
    "vaccinated" BOOLEAN NOT NULL DEFAULT false,
    "dose1_date" TIMESTAMP(3),
    "dose2_date" TIMESTAMP(3),
    "evolution" TEXT,
    "evolution_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "srag_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "srag_cases_state_notification_date_idx" ON "srag_cases"("state", "notification_date");

-- CreateIndex
CREATE INDEX "srag_cases_notification_date_idx" ON "srag_cases"("notification_date");

-- CreateIndex
CREATE INDEX "srag_cases_evolution_idx" ON "srag_cases"("evolution");
