-- CreateTable
CREATE TABLE "TA_Application" (
    "id" SERIAL NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "transcript_url" VARCHAR(255),
    "payment_proof_url" VARCHAR(255),
    "requirements_status" TEXT NOT NULL DEFAULT 'belum_upload',
    "requirements_feedback" TEXT,
    "proposal_title" VARCHAR(255),
    "proposal_file_url" VARCHAR(255),
    "proposal_status" TEXT NOT NULL DEFAULT 'belum_diajukan',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TA_Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TA_Committee" (
    "id" SERIAL NOT NULL,
    "jurusan_id" VARCHAR(10) NOT NULL,
    "dosen_id" INTEGER NOT NULL,
    "position" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TA_Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TA_Settings" (
    "id" SERIAL NOT NULL,
    "jurusan_id" VARCHAR(10) NOT NULL,
    "approval_mode" TEXT NOT NULL DEFAULT 'kaprodi',

    CONSTRAINT "TA_Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TA_Committee_jurusan_id_position_key" ON "TA_Committee"("jurusan_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "TA_Settings_jurusan_id_key" ON "TA_Settings"("jurusan_id");

-- AddForeignKey
ALTER TABLE "TA_Application" ADD CONSTRAINT "TA_Application_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TA_Committee" ADD CONSTRAINT "TA_Committee_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TA_Committee" ADD CONSTRAINT "TA_Committee_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TA_Settings" ADD CONSTRAINT "TA_Settings_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
