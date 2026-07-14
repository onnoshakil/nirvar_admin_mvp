-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'INST_ADMIN');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "institutionId" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" "InstitutionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceRegistration" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceModel" TEXT,
    "deviceName" TEXT,
    "institutionId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalPolicy" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "appWhitelist" JSONB NOT NULL DEFAULT '[]',
    "appBlacklist" JSONB NOT NULL DEFAULT '[]',
    "categoryFilters" JSONB NOT NULL DEFAULT '[]',
    "screenTimeLimitMin" INTEGER,
    "dnsSafeBrowsing" BOOLEAN NOT NULL DEFAULT false,
    "installRestriction" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "GlobalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSyncStatus" (
    "deviceId" TEXT NOT NULL,
    "policyVersionApplied" INTEGER NOT NULL DEFAULT 0,
    "lastHeartbeatAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),

    CONSTRAINT "DeviceSyncStatus_pkey" PRIMARY KEY ("deviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_institutionId_idx" ON "AdminUser"("institutionId");

-- CreateIndex
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceRegistration_deviceId_key" ON "DeviceRegistration"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceRegistration_institutionId_idx" ON "DeviceRegistration"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_deviceId_key" ON "Student"("deviceId");

-- CreateIndex
CREATE INDEX "Student_institutionId_idx" ON "Student"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalPolicy_institutionId_key" ON "GlobalPolicy"("institutionId");

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceRegistration" ADD CONSTRAINT "DeviceRegistration_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "DeviceRegistration"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalPolicy" ADD CONSTRAINT "GlobalPolicy_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSyncStatus" ADD CONSTRAINT "DeviceSyncStatus_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "DeviceRegistration"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;
