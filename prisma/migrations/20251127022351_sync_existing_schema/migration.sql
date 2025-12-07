-- CreateTable
CREATE TABLE "Jurusan" (
    "id" VARCHAR(10) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,

    CONSTRAINT "Jurusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prodi" (
    "id" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "jurusan_id" VARCHAR(10) NOT NULL,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "identifier" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "telepon" VARCHAR(20),
    "nomor_rekening" VARCHAR(50),
    "prodi_id" VARCHAR(20),
    "jurusan_id" VARCHAR(10),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "nama_role" VARCHAR(50) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "User_Roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "Academic_Period" (
    "id" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "Academic_Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "sks" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "prodi_id" VARCHAR(20) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course_Pengampu" (
    "course_id" INTEGER NOT NULL,
    "dosen_id" INTEGER NOT NULL,

    CONSTRAINT "Course_Pengampu_pkey" PRIMARY KEY ("course_id","dosen_id")
);

-- CreateTable
CREATE TABLE "SA_Application" (
    "id" SERIAL NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "period_id" VARCHAR(20) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "tanggal_pengajuan" TIMESTAMP(6),
    "tanggal_pembayaran" TIMESTAMP(6),
    "bukti_pembayaran_url" VARCHAR(255),
    "alasan_ditolak" TEXT,
    "max_sks" INTEGER,

    CONSTRAINT "SA_Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application_Course" (
    "application_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "dosen_id" INTEGER,
    "nilai" CHAR(2),
    "jadwal" VARCHAR(255),
    "ruang" VARCHAR(50),
    "materi_url" VARCHAR(255),
    "kelas_selesai" BOOLEAN DEFAULT false,

    CONSTRAINT "Application_Course_pkey" PRIMARY KEY ("application_id","course_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document_Recipient" (
    "document_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Document_Recipient_pkey" PRIMARY KEY ("document_id","user_id")
);

-- CreateTable
CREATE TABLE "Document_Template" (
    "id" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "uploader_id" INTEGER,

    CONSTRAINT "Document_Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leave_Application" (
    "id" SERIAL NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "period_id" VARCHAR(20) NOT NULL,
    "form_url" VARCHAR(255) NOT NULL,
    "durasi" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "tanggal_pengajuan" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alasan_ditolak" TEXT,

    CONSTRAINT "Leave_Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_identifier_key" ON "User"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nama_role_key" ON "Role"("nama_role");

-- CreateIndex
CREATE UNIQUE INDEX "Course_kode_key" ON "Course"("kode");

-- AddForeignKey
ALTER TABLE "Prodi" ADD CONSTRAINT "Prodi_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "Jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Roles" ADD CONSTRAINT "User_Roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Roles" ADD CONSTRAINT "User_Roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Pengampu" ADD CONSTRAINT "Course_Pengampu_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Pengampu" ADD CONSTRAINT "Course_Pengampu_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SA_Application" ADD CONSTRAINT "SA_Application_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SA_Application" ADD CONSTRAINT "SA_Application_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Academic_Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application_Course" ADD CONSTRAINT "Application_Course_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "SA_Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application_Course" ADD CONSTRAINT "Application_Course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application_Course" ADD CONSTRAINT "Application_Course_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document_Recipient" ADD CONSTRAINT "Document_Recipient_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document_Recipient" ADD CONSTRAINT "Document_Recipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document_Template" ADD CONSTRAINT "Document_Template_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave_Application" ADD CONSTRAINT "Leave_Application_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave_Application" ADD CONSTRAINT "Leave_Application_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Academic_Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
