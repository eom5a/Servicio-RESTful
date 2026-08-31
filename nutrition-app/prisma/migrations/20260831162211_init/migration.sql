-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BodyMetricEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" REAL NOT NULL,
    "bodyFatPercent" REAL,
    "muscleMassKg" REAL,
    "waterPercent" REAL,
    "visceralFat" REAL,
    "boneMassKg" REAL,
    "bmr" INTEGER,
    "sourceImageUrl" TEXT,
    "rawAiResponse" TEXT,
    "aiConfidence" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BodyMetricEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eatenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType" TEXT,
    "description" TEXT,
    "calories" INTEGER NOT NULL,
    "proteinG" REAL NOT NULL,
    "carbsG" REAL NOT NULL,
    "fatG" REAL NOT NULL,
    "fiberG" REAL,
    "photoUrl" TEXT,
    "rawAiResponse" TEXT,
    "aiConfidence" REAL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "durationMin" INTEGER,
    "caloriesBurned" INTEGER,
    "rawReportText" TEXT,
    "rawAiResponse" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExerciseEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weightKg" REAL,
    "reps" INTEGER,
    "rpe" REAL,
    "notes" TEXT,
    CONSTRAINT "WorkoutSet_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NutritionTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caloriesTarget" INTEGER NOT NULL,
    "proteinTargetG" REAL NOT NULL,
    "carbsTargetG" REAL NOT NULL,
    "fatTargetG" REAL NOT NULL,
    "goalBodyFatPct" REAL,
    "goalWeightKg" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "NutritionTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyCoachNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "highlights" TEXT,
    "rawAiResponse" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyCoachNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "BodyMetricEntry_userId_recordedAt_idx" ON "BodyMetricEntry"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "MealEntry_userId_eatenAt_idx" ON "MealEntry"("userId", "eatenAt");

-- CreateIndex
CREATE INDEX "ExerciseEntry_userId_performedAt_idx" ON "ExerciseEntry"("userId", "performedAt");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_date_idx" ON "WorkoutSession"("userId", "date");

-- CreateIndex
CREATE INDEX "WorkoutSet_exerciseName_idx" ON "WorkoutSet"("exerciseName");

-- CreateIndex
CREATE INDEX "NutritionTarget_userId_active_idx" ON "NutritionTarget"("userId", "active");

-- CreateIndex
CREATE INDEX "DailyCoachNote_userId_date_idx" ON "DailyCoachNote"("userId", "date");
