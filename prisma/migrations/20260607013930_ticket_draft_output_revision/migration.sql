-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "TicketDetail" ADD COLUMN     "outputLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "revisionAsset" TEXT,
ADD COLUMN     "revisionNote" TEXT;
