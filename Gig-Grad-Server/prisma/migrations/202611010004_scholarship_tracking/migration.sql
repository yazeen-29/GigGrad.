-- CreateTable
CREATE TABLE "ScholarshipTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SAVED',
    "notes" TEXT NOT NULL DEFAULT '',
    "remindOn" TIMESTAMP(3),
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScholarshipTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScholarshipTracking_userId_remindOn_idx" ON "ScholarshipTracking"("userId", "remindOn");

-- CreateIndex
CREATE UNIQUE INDEX "ScholarshipTracking_userId_scholarshipId_key" ON "ScholarshipTracking"("userId", "scholarshipId");

-- AddForeignKey
ALTER TABLE "ScholarshipTracking" ADD CONSTRAINT "ScholarshipTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScholarshipTracking" ADD CONSTRAINT "ScholarshipTracking_status_check" CHECK ("status" IN ('SAVED','PREPARING','APPLIED','AWARDED','NOT_SELECTED'));
ALTER TABLE "ScholarshipTracking" ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL PRIVILEGES ON TABLE "ScholarshipTracking" FROM anon; END IF;
IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL PRIVILEGES ON TABLE "ScholarshipTracking" FROM authenticated; END IF;
END $$;
