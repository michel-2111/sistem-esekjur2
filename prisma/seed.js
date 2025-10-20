// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Membersihkan data lama
    await prisma.application_Course.deleteMany({});
    await prisma.sA_Application.deleteMany({});
    await prisma.course_Pengampu.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.user_Roles.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.prodi.deleteMany({});
    await prisma.jurusan.deleteMany({});
    await prisma.academic_Period.deleteMany({});
    console.log('Old data cleaned.');

    // --- SEEDING DATA MASTER ---
    console.log('Seeding master data...');
    await prisma.role.createMany({ data: [ { nama_role: 'mahasiswa' }, { nama_role: 'dosen' }, { nama_role: 'kaprodi' }, { nama_role: 'sekjur' }, { nama_role: 'kajur' }, { nama_role: 'wadir' }, { nama_role: 'p4m' } ] });
    await prisma.jurusan.createMany({ data: [ { id: 'TE', nama: 'Teknik Elektro' } ] });
    await prisma.prodi.createMany({ data: [ { id: 'TE_D4_TI', nama: 'D4 Teknik Informatika', jurusan_id: 'TE' }, { id: 'TE_D3_TK', nama: 'D3 Teknik Komputer', jurusan_id: 'TE' } ] });
    await prisma.academic_Period.createMany({ data: [ { id: 'SA_GANJIL_2025', nama: 'SA Ganjil 2025/2026', start_date: new Date('2025-09-01'), end_date: new Date('2025-10-31') } ] });
    console.log('Master data seeded.');

    // --- SEEDING USERS ---
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('123', 12);
    // Kaprodi D4 TI
    const kaprodi = await prisma.user.create({ data: { nama: 'Harson Kapoh', identifier: '198501001', password: hashedPassword, prodi_id: 'TE_D4_TI', roles: { create: [{ role: { connect: { nama_role: 'kaprodi' } } }, { role: { connect: { nama_role: 'dosen' } } }] }} });
    // Sekjur TE
    const sekjur = await prisma.user.create({ data: { nama: 'Maksy Sendiang', identifier: '199002002', password: hashedPassword, jurusan_id: 'TE', roles: { create: [{ role: { connect: { nama_role: 'sekjur' } } }, { role: { connect: { nama_role: 'dosen' } } }] }} });
    // Dosen Biasa
    const dosen1 = await prisma.user.create({ data: { nama: 'Tracy Marcela', identifier: '198803003', password: hashedPassword, jurusan_id: 'TE', roles: { create: { role: { connect: { nama_role: 'dosen' } } } }} });
    
    // MAHASISWA BARU di prodi yang benar (D4 TI)
    const mahasiswaTI = await prisma.user.create({ data: { nama: 'Andi Pratama', identifier: '22024119', password: hashedPassword, prodi_id: 'TE_D4_TI', roles: { create: { role: { connect: { nama_role: 'mahasiswa' } } } }} });
    console.log('Users seeded.');
    
    // --- SEEDING COURSES ---
    console.log('Seeding courses...');
    const course1 = await prisma.course.create({ data: { kode: 'TI101', nama: 'Dasar Pemrograman', sks: 3, semester: 1, prodi: { connect: { id: 'TE_D4_TI' } } }});
    const course2 = await prisma.course.create({ data: { kode: 'TI102', nama: 'Logika Matematika', sks: 3, semester: 1, prodi: { connect: { id: 'TE_D4_TI' } } }});
    console.log('Courses seeded.');

    // === BAGIAN BARU: SEEDING APLIKASI YANG SIAP DI-ASSIGN ===
    console.log('Seeding a ready-to-assign application...');
    const saApplication = await prisma.sA_Application.create({
        data: {
            mahasiswa_id: mahasiswaTI.id,
            period_id: 'SA_GANJIL_2025',
            status: 'menunggu_penugasan_dosen', // Status yang dicari oleh Kaprodi
            tanggal_pengajuan: new Date(),
            tanggal_pembayaran: new Date(),
            max_sks: 9,
        }
    });

    // Menghubungkan aplikasi dengan mata kuliah yang diajukan
    await prisma.application_Course.createMany({
        data: [
            { application_id: saApplication.id, course_id: course1.id },
            { application_id: saApplication.id, course_id: course2.id },
        ]
    });
    console.log('Ready-to-assign application seeded.');
    
    console.log('--- Seeding finished successfully! ---');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });