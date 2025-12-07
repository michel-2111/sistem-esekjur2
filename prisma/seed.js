// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    console.log('Seeding master data...');
    
    await prisma.role.createMany({
        data: [
            { nama_role: 'mahasiswa' }, { nama_role: 'dosen' },
            { nama_role: 'kaprodi' }, { nama_role: 'sekjur' },
            { nama_role: 'kajur' }, { nama_role: 'wadir' },
            { nama_role: 'p4m' },
            { nama_role: 'panitia' }
        ],
        skipDuplicates: true,
    });

    await prisma.jurusan.createMany({
        data: [ { id: 'TE', nama: 'Teknik Elektro' } ],
        skipDuplicates: true,
    });

    await prisma.prodi.createMany({
        data: [
            { id: 'TE_D4_TI', nama: 'D4 Teknik Informatika', jurusan_id: 'TE' },
            { id: 'TE_D3_TK', nama: 'D3 Teknik Komputer', jurusan_id: 'TE' }
        ],
        skipDuplicates: true,
    });

    await prisma.academic_Period.createMany({
        data: [
            { id: 'SA_GANJIL_2025', nama: 'SA Ganjil 2025/2026', start_date: new Date('2025-09-01'), end_date: new Date('2025-10-31') }
        ],
        skipDuplicates: true,
    });

    await prisma.document_Template.upsert({
        where: { id: 'TPL_CUTI_01' },
        update: {},
        create: {
            id: 'TPL_CUTI_01',
            title: 'Formulir Pengajuan Cuti Akademik.pdf',
            file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'cuti_form',
        }
    });

    console.log('Master data seeded/verified.');

    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('123', 12);

    // Fungsi upsertUser yang sudah diperbaiki
    const upsertUser = async (identifier, name, prodiId, jurusanId, roleNames) => {
        // 1. Upsert user dulu
        const user = await prisma.user.upsert({
            where: { identifier },
            update: {
                nama: name,
                prodi_id: prodiId,
                jurusan_id: jurusanId
            },
            create: {
                identifier,
                nama: name,
                password: hashedPassword,
                prodi_id: prodiId,
                jurusan_id: jurusanId
            }
        });

        // 2. Hapus semua roles lama untuk user ini
        await prisma.user_Roles.deleteMany({
            where: { user_id: user.id }
        });

        // 3. Tambahkan roles baru
        for (const roleName of roleNames) {
            const role = await prisma.role.findUnique({
                where: { nama_role: roleName }
            });
            
            if (role) {
                await prisma.user_Roles.create({
                    data: {
                        user_id: user.id,
                        role_id: role.id
                    }
                });
            }
        }

        return user;
    };

    await upsertUser('198501001', 'Harson Kapoh', 'TE_D4_TI', null, ['kaprodi', 'dosen']);
    
    const maksyUser = await upsertUser('199002002', 'Maksy Sendiang', null, 'TE', ['sekjur', 'dosen', 'panitia']);
    
    await upsertUser('198803003', 'Tracy Marcela', null, 'TE', ['dosen']);
    const mahasiswaTI = await upsertUser('22024119', 'Andi Pratama', 'TE_D4_TI', null, ['mahasiswa']);

    console.log('Users seeded/verified.');
    
    console.log('Seeding courses...');
    const course1 = await prisma.course.upsert({
        where: { kode: 'TI101' },
        update: {},
        create: { kode: 'TI101', nama: 'Dasar Pemrograman', sks: 3, semester: 1, prodi: { connect: { id: 'TE_D4_TI' } } }
    });
    const course2 = await prisma.course.upsert({
        where: { kode: 'TI102' },
        update: {},
        create: { kode: 'TI102', nama: 'Logika Matematika', sks: 3, semester: 1, prodi: { connect: { id: 'TE_D4_TI' } } }
    });
    console.log('Courses seeded/verified.');

    console.log('Seeding TA Settings & Committee...');
    
    await prisma.tA_Settings.upsert({
        where: { jurusan_id: 'TE' },
        update: {},
        create: {
            jurusan_id: 'TE',
            approval_mode: 'kaprodi'
        }
    });

    await prisma.tA_Committee.deleteMany({
        where: { 
            jurusan_id: 'TE',
            position: 'ketua' 
        }
    });

    await prisma.tA_Committee.create({
        data: {
            jurusan_id: 'TE',
            dosen_id: maksyUser.id,
            position: 'ketua',
            is_active: true
        }
    });

    console.log('TA Committee seeded (Maksy as Ketua).');

    console.log('Checking SA Application...');
    const existingSA = await prisma.sA_Application.findFirst({
        where: { mahasiswa_id: mahasiswaTI.id, period_id: 'SA_GANJIL_2025' }
    });

    if (!existingSA) {
        const saApplication = await prisma.sA_Application.create({
            data: {
                mahasiswa_id: mahasiswaTI.id,
                period_id: 'SA_GANJIL_2025',
                status: 'menunggu_penugasan_dosen',
                tanggal_pengajuan: new Date(),
                tanggal_pembayaran: new Date(),
                max_sks: 9,
            }
        });
        await prisma.application_Course.createMany({
            data: [
                { application_id: saApplication.id, course_id: course1.id },
                { application_id: saApplication.id, course_id: course2.id },
            ]
        });
        console.log('SA Application created.');
    } else {
        console.log('SA Application already exists, skipping.');
    }
    
    console.log('--- Seeding finished successfully! ---');
}

main()
    .catch((e) => {
        console.error('Error during seeding:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });