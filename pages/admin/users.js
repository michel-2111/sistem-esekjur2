import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../../components/Layout';

/* ------------------------------------------------------------------ */
/*  Small inline icon set (no external icon library required)         */
/* ------------------------------------------------------------------ */
const Icon = {
    check: (p) => (
        <svg viewBox="0 0 20 20" fill="currentColor" className={p.className}>
        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
        </svg>
    ),
    alert: (p) => (
        <svg viewBox="0 0 20 20" fill="currentColor" className={p.className}>
        <path fillRule="evenodd" d="M8.3 3.1c.7-1.2 2.7-1.2 3.4 0l6.4 11.2c.7 1.2-.2 2.7-1.7 2.7H3.6c-1.5 0-2.4-1.5-1.7-2.7L8.3 3.1zM10 7a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 7zm0 7.5a.9.9 0 100-1.8.9.9 0 000 1.8z" clipRule="evenodd" />
        </svg>
    ),
    close: (p) => (
        <svg viewBox="0 0 20 20" fill="currentColor" className={p.className}>
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
    ),
    edit: (p) => (
        <svg viewBox="0 0 20 20" fill="currentColor" className={p.className}>
        <path d="M13.6 2.4a1.5 1.5 0 012.1 2.1l-1 1-2.1-2.1 1-1zM11.6 4.4L3 13v2.1h2.1L13.6 6.5l-2-2.1z" />
        </svg>
    ),
    trash: (p) => (
        <svg viewBox="0 0 20 20" fill="currentColor" className={p.className}>
        <path fillRule="evenodd" d="M8 2a1 1 0 00-1 1v1H4a1 1 0 000 2h.1l.7 9.3A2 2 0 006.8 17h6.4a2 2 0 002-1.7l.7-9.3h.1a1 1 0 100-2h-3V3a1 1 0 00-1-1H8zm1 2h2V4H9v0zM6.9 6l.6 9h5l.6-9H6.9z" clipRule="evenodd" />
        </svg>
    ),
    spinner: (p) => (
        <svg viewBox="0 0 24 24" fill="none" className={p.className}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    users: (p) => (
        <svg viewBox="0 0 20 20" fill="currentColor" className={p.className}>
        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM13.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 15c0-2.8 2.2-5 5-5s5 2.2 5 5v.5H2V15zM12.7 10.3c1.9.6 3.3 2.4 3.3 4.7v.5h-3v-.5c0-1.6-.5-3-1.4-4.2.4-.3.7-.4 1.1-.5z" />
        </svg>
    ),
    };

    /* ------------------------------------------------------------------ */
    /*  Toast notification system (replaces conventional alert banners)   */
    /* ------------------------------------------------------------------ */
    function useToasts() {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((type, text) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, type, text }]);
        setTimeout(() => dismiss(id), 4200);
    }, [dismiss]);

    return { toasts, push, dismiss };
    }

    function ToastStack({ toasts, dismiss }) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
            const isSuccess = t.type === 'success';
            return (
            <div
                key={t.id}
                role="status"
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-[toast-in_0.25s_ease-out]
                ${isSuccess ? 'bg-emerald-50/95 border-emerald-200' : 'bg-red-50/95 border-red-200'}`}
            >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                ${isSuccess ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                {isSuccess ? <Icon.check className="h-3.5 w-3.5" /> : <Icon.alert className="h-3.5 w-3.5" />}
                </div>
                <p className={`flex-1 text-sm font-medium leading-snug ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>
                {t.text}
                </p>
                <button
                onClick={() => dismiss(t.id)}
                className={`shrink-0 rounded p-0.5 transition-colors ${isSuccess ? 'text-emerald-500 hover:bg-emerald-100' : 'text-red-500 hover:bg-red-100'}`}
                aria-label="Tutup notifikasi"
                >
                <Icon.close className="h-4 w-4" />
                </button>
            </div>
            );
        })}
        <style jsx global>{`
            @keyframes toast-in {
            from { opacity: 0; transform: translateY(-8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
            }
        `}</style>
        </div>
    );
    }

    /* ------------------------------------------------------------------ */
    /*  Confirm dialog (replaces window.confirm)                          */
    /* ------------------------------------------------------------------ */
    function ConfirmDeleteDialog({ target, onCancel, onConfirm, isDeleting }) {
    if (!target) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] animate-[fade-in_0.15s_ease-out]" onClick={!isDeleting ? onCancel : undefined} />
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-[dialog-in_0.18s_ease-out]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Icon.trash className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">Hapus pengguna ini?</h3>
            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
            Anda akan menghapus <span className="font-medium text-gray-700">{target.nama}</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex gap-3">
            <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
                Batal
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {isDeleting && <Icon.spinner className="h-4 w-4 animate-spin" />}
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
            </div>
        </div>
        <style jsx global>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes dialog-in { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
        </div>
    );
    }

    /* ------------------------------------------------------------------ */
    /*  Small presentational helpers                                      */
    /* ------------------------------------------------------------------ */
    const ROLE_COLORS = [
    'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
    'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200',
    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200',
    'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
    ];
    const roleColor = (id) => ROLE_COLORS[Math.abs(String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % ROLE_COLORS.length];

    function Initials({ name }) {
    const initials = (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('');
    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white">
        {initials || '?'}
        </div>
    );
    }

    function TableSkeleton() {
    return (
        <div className="animate-pulse divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
            <div className="h-9 w-9 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 rounded bg-gray-200" />
                <div className="h-2.5 w-1/6 rounded bg-gray-100" />
            </div>
            <div className="h-5 w-20 rounded bg-gray-100" />
            <div className="h-5 w-16 rounded bg-gray-100" />
            </div>
        ))}
        </div>
    );
    }

    /* ------------------------------------------------------------------ */
    /*  Main page                                                          */
    /* ------------------------------------------------------------------ */
    export default function KelolaUsersAdmin() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [jurusanList, setJurusanList] = useState([]);
    const [prodiList, setProdiList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [nama, setNama] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRoles, setSelectedRoles] = useState([]);

    const [selectedJurusan, setSelectedJurusan] = useState('');
    const [selectedProdi, setSelectedProdi] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null); // { id, nama }
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const { toasts, push, dismiss } = useToasts();
    const formTopRef = useRef(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (res.ok) {
            setRoles(data.roles || []);
            setUsers(data.users || []);
            setJurusanList(data.jurusan || []);
            setProdiList(data.prodi || []);
        } else {
            push('error', data.message || 'Gagal memuat data pengguna.');
        }
        } catch (err) {
        console.error('Gagal memuat data', err);
        push('error', 'Tidak dapat terhubung ke server. Periksa koneksi Anda.');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredProdi = prodiList.filter((prodi) => prodi.jurusan_id === selectedJurusan);

    const filteredUsers = users.filter((u) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return (
        u.nama?.toLowerCase().includes(q) ||
        u.identifier?.toLowerCase().includes(q) ||
        u.jurusan?.nama?.toLowerCase().includes(q) ||
        u.prodi?.nama?.toLowerCase().includes(q) ||
        u.roles.some((r) => r.role.nama_role?.toLowerCase().includes(q))
        );
    });

    const handleRoleChange = (roleId) => {
        setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
    };

    const handleEdit = (user) => {
        setNama(user.nama);
        setIdentifier(user.identifier);
        setPassword('');
        setSelectedJurusan(user.jurusan_id || '');
        setSelectedProdi(user.prodi_id || '');
        setSelectedRoles(user.roles.map((r) => r.role.id));
        setEditId(user.id);
        setIsEditing(true);
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const resetForm = () => {
        setNama('');
        setIdentifier('');
        setPassword('');
        setSelectedRoles([]);
        setSelectedJurusan('');
        setSelectedProdi('');
        setEditId(null);
        setIsEditing(false);
    };

    const requestDelete = (user) => setDeleteTarget({ id: user.id, nama: user.nama });

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
        const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Gagal menghapus pengguna');
        push('success', `Pengguna "${deleteTarget.nama}" berhasil dihapus.`);
        setDeleteTarget(null);
        loadData();
        } catch (err) {
        push('error', err.message);
        } finally {
        setIsDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditing && !password) {
        return push('error', 'Password wajib diisi untuk pengguna baru.');
        }
        if (selectedRoles.length === 0) {
        return push('error', 'Minimal satu role harus dipilih.');
        }

        setIsSubmitting(true);
        try {
        const res = await fetch('/api/admin/users', {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            id: editId,
            nama,
            identifier,
            password,
            roleIds: selectedRoles,
            jurusan_id: selectedJurusan || null,
            prodi_id: selectedProdi || null,
            }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Gagal menyimpan data');

        push('success', result.message || 'Data pengguna berhasil disimpan.');
        resetForm();
        loadData();
        } catch (err) {
        push('error', err.message);
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <Layout>
        <ToastStack toasts={toasts} dismiss={dismiss} />
        <ConfirmDeleteDialog
            target={deleteTarget}
            isDeleting={isDeleting}
            onCancel={() => (!isDeleting ? setDeleteTarget(null) : null)}
            onConfirm={confirmDelete}
        />

        <div className="min-h-screen bg-gray-50/60 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div ref={formTopRef} className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                <Icon.users className="h-5 w-5" />
                </div>
                <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Pengguna</h1>
                <p className="text-sm text-gray-500">Kelola akun, role, dan relasi akademik pengguna sistem.</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                <h2 className="text-sm font-semibold text-gray-800">
                    {isEditing ? `Edit Pengguna — ${nama || ''}` : 'Tambah Pengguna Baru'}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                    {isEditing ? 'Perbarui detail akun di bawah ini.' : 'Lengkapi form untuk membuat akun pengguna baru.'}
                </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                {/* Section: data dasar */}
                <fieldset className="space-y-4">
                    <legend className="text-xs font-semibold uppercase tracking-wide text-gray-400">Informasi Dasar</legend>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Field label="Nama Lengkap" required>
                        <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        required
                        placeholder="Contoh: Siti Rahmawati"
                        className="input"
                        />
                    </Field>

                    <Field label="Identifier (NIP/NIM/User)" required>
                        <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        disabled={isEditing}
                        placeholder="Contoh: 198501012010"
                        className="input disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                        />
                    </Field>

                    <Field
                        label="Password"
                        hint={isEditing ? 'Kosongkan jika tidak ingin mengubah' : undefined}
                        required={!isEditing}
                    >
                        <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isEditing ? '••••••••' : 'Minimal 8 karakter'}
                        className="input"
                        />
                    </Field>
                    </div>
                </fieldset>

                {/* Section: akademik */}
                <fieldset className="space-y-4 border-t border-gray-100 pt-6">
                    <legend className="text-xs font-semibold uppercase tracking-wide text-gray-400">Relasi Akademik (Opsional)</legend>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Jurusan">
                        <select
                        value={selectedJurusan}
                        onChange={(e) => {
                            setSelectedJurusan(e.target.value);
                            setSelectedProdi('');
                        }}
                        className="input bg-white"
                        >
                        <option value="">— Tidak Ada —</option>
                        {jurusanList.map((j) => (
                            <option key={j.id} value={j.id}>{j.nama}</option>
                        ))}
                        </select>
                    </Field>

                    <Field label="Program Studi" hint={!selectedJurusan ? 'Pilih jurusan terlebih dahulu' : undefined}>
                        <select
                        value={selectedProdi}
                        onChange={(e) => setSelectedProdi(e.target.value)}
                        disabled={!selectedJurusan}
                        className="input bg-white disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                        >
                        <option value="">— Tidak Ada —</option>
                        {filteredProdi.map((p) => (
                            <option key={p.id} value={p.id}>{p.nama}</option>
                        ))}
                        </select>
                    </Field>
                    </div>
                </fieldset>

                {/* Section: roles */}
                <fieldset className="border-t border-gray-100 pt-6">
                    <legend className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Assign Role <span className="text-red-500">*</span>
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                    {roles.map((role) => {
                        const active = selectedRoles.includes(role.id);
                        return (
                        <button
                            type="button"
                            key={role.id}
                            onClick={() => handleRoleChange(role.id)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors
                            ${active
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                        >
                            {role.nama_role}
                        </button>
                        );
                    })}
                    {roles.length === 0 && <p className="text-sm text-gray-400">Belum ada role tersedia.</p>}
                    </div>
                </fieldset>

                {/* Actions */}
                <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
                    <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                    {isSubmitting && <Icon.spinner className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Pengguna'}
                    </button>
                    {isEditing && (
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={isSubmitting}
                        className="rounded-lg px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                    >
                        Batal
                    </button>
                    )}
                </div>
                </form>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-gray-800">Daftar Pengguna Sistem</h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                    {searchQuery ? `${filteredUsers.length} dari ${users.length} pengguna` : `${users.length} pengguna terdaftar`}
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    >
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.58 3.58a.75.75 0 11-1.06 1.06l-3.58-3.58A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                    <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, identifier, prodi, atau role..."
                    className="input !pl-9 !pr-8"
                    />
                    {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Bersihkan pencarian"
                    >
                        <Icon.close className="h-3.5 w-3.5" />
                    </button>
                    )}
                </div>
                </div>

                {isLoading ? (
                <TableSkeleton />
                ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Icon.users className="h-6 w-6" />
                    </div>
                    {searchQuery ? (
                    <>
                        <p className="text-sm font-medium text-gray-700">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
                        <p className="mt-1 text-sm text-gray-400">Coba kata kunci lain atau periksa ejaan.</p>
                    </>
                    ) : (
                    <>
                        <p className="text-sm font-medium text-gray-700">Belum ada pengguna</p>
                        <p className="mt-1 text-sm text-gray-400">Tambahkan pengguna baru melalui form di atas.</p>
                    </>
                    )}
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        <th className="px-6 py-3">Nama & Identifier</th>
                        <th className="px-6 py-3">Jurusan / Prodi</th>
                        <th className="px-6 py-3">Roles</th>
                        <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredUsers.map((u) => (
                        <tr key={u.id} className="transition-colors hover:bg-gray-50/80">
                            <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                                <Initials name={u.nama} />
                                <div>
                                <div className="font-medium text-gray-900">{u.nama}</div>
                                <div className="text-xs text-gray-500">{u.identifier}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-3.5">
                            <div className="text-gray-800">{u.jurusan ? u.jurusan.nama : <span className="text-gray-300">—</span>}</div>
                            <div className="text-xs text-gray-500">{u.prodi ? u.prodi.nama : ''}</div>
                            </td>
                            <td className="px-6 py-3.5">
                            <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                                {u.roles.map((r) => (
                                <span key={r.role.id} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColor(r.role.id)}`}>
                                    {r.role.nama_role}
                                </span>
                                ))}
                            </div>
                            </td>
                            <td className="px-6 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                                <button
                                onClick={() => handleEdit(u)}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                                >
                                <Icon.edit className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                onClick={() => requestDelete(u)}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                                >
                                <Icon.trash className="h-3.5 w-3.5" /> Hapus
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            </div>
        </div>

        <style jsx global>{`
            .input {
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid #d1d5db;
            padding: 0.55rem 0.75rem;
            font-size: 0.875rem;
            color: #111827;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
            }
            .input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
            }
        `}</style>
        </Layout>
    );
}

/* Small labeled field wrapper to keep the form markup readable */
function Field({ label, required, hint, children }) {
    return (
        <div>
        <label className="mb-1 flex items-baseline justify-between">
            <span className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
            </span>
            {hint && <span className="text-xs text-gray-400">{hint}</span>}
        </label>
        {children}
        </div>
    );
}