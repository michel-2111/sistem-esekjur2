// context/AppContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [activePeriod, setActivePeriod] = useState(null);
    const router = useRouter();

    useEffect(() => {
    if (user) {
        fetch('/api/master/periods') // Gunakan API master yang sudah ada
            .then(res => res.json())
            .then(setActivePeriod)
            .catch(console.error);
    }
        }, [user]);
    
    const login = (userData) => {
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = async () => {
        // Nantinya kita bisa tambahkan call API untuk clear cookie di sini
        setUser(null);
        router.push('/login');
    };

    // FUNGSI BARU
    const switchRole = (newUserData) => {
        setUser(newUserData); // Update state pengguna
        router.push('/dashboard'); // Arahkan ke dashboard
    };

    const contextValue = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        activePeriod,
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
    }

    export function useAppContext() {
    return useContext(AppContext);
}