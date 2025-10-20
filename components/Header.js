// components/Header.js
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router'; // <-- Impor useRouter
import { BookOpenCheck, LogOut, ChevronDown, Replace, User } from 'lucide-react';
import ProfileModal from './shared/ProfileModal';

export default function Header() {
    const { user, logout, switchRole, activePeriod } = useAppContext();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    if (!user) return null;

    const handleSwitchRole = async (role) => {
        setDropdownOpen(false);
        if (role === user.selectedRole) return; // Jangan lakukan apa-apa jika peran sama

        try {
            const res = await fetch('/api/auth/switch-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newRole: role }),
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            // Panggil fungsi dari context untuk update state dan redirect
            switchRole(data.user);

        } catch (error) {
            console.error('Failed to switch role:', error);
            alert(error.message);
        }
    };

    return (
        <>
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <BookOpenCheck className="h-8 w-8 text-blue-600" />
                    <span className="text-xl font-bold text-gray-800">Sistem Esekjur</span>
                    {activePeriod && <span className="ml-4 text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{activePeriod.nama}</span>}
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                            onClick={() => setIsProfileModalOpen(true)} 
                            className="p-2 rounded-full text-gray-900 hover:bg-gray-100 hover:text-gray-800 focus:outline-none" 
                            title="Pengaturan Profil"
                        >
                            <User size={20} />
                        </button>
                    <div className="relative">
                        <button 
                            onClick={() => user.roles.length > 1 && setDropdownOpen(!isDropdownOpen)}
                            className="flex items-center text-gray-700 font-medium p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                        >
                            {user.nama} (<span className="capitalize">{user.selectedRole}</span>)
                            {user.roles.length > 1 && <ChevronDown className="ml-1 h-4 w-4" />}
                        </button>
                        {isDropdownOpen && user.roles.length > 1 && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <p className="px-4 py-2 text-xs text-gray-500">Ganti Peran</p>
                                {user.roles.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => handleSwitchRole(role)}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        disabled={role === user.selectedRole}
                                    >
                                        <Replace size={16} className="inline-block mr-2" />
                                        <span className="capitalize">{role}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={logout} className="flex items-center text-red-500 hover:text-red-700 font-semibold">
                        <LogOut className="mr-1 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
        
        <ProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />
        </>
    );
}