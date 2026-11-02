-- AlterTable
ALTER TABLE "User" ADD COLUMN     "posterReason" TEXT,
ADD COLUMN     "posterStatus" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "posterType" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "User_posterStatus_createdAt_idx" ON "User"("posterStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_status_deadline_idx" ON "Job"("status", "deadline");

-- CreateIndex
CREATE INDEX "Job_postedById_createdAt_idx" ON "Job"("postedById", "createdAt");

-- CreateIndex
CREATE INDEX "Job_assignedToId_status_idx" ON "Job"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "Application_applicantId_appliedAt_idx" ON "Application"("applicantId", "appliedAt");

-- CreateIndex
CREATE INDEX "Application_jobId_status_idx" ON "Application"("jobId", "status");

-- CreateIndex
CREATE INDEX "Message_jobId_createdAt_idx" ON "Message"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_receiverId_isRead_idx" ON "Message"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX "Dispute_status_createdAt_idx" ON "Dispute"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Review_revieweeId_idx" ON "Review"("revieweeId");


-- Protect invariants even when data is written outside the API.
ALTER TABLE "User" ADD CONSTRAINT "User_posterStatus_check" CHECK ("posterStatus" IN ('none', 'pending', 'approved', 'rejected'));
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "Review" ADD CONSTRAINT "Review_participants_check" CHECK ("reviewerId" <> "revieweeId");
ALTER TABLE "Job" ADD CONSTRAINT "Job_amount_check" CHECK ("amount" > 0);
