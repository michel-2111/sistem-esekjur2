// context/AppContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [activePeriod, setActivePeriod] = useState(null);
    const [isAppLoading, setIsAppLoading] = useState(true); 
    const router = useRouter();

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Gagal verifikasi sesi:", error);
                setUser(null);
            } finally {
                setIsAppLoading(false);
            }
        };

        verifySession();
    }, []);

    useEffect(() => {
        if (user) {
            fetch('/api/master/periods')
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
        setUser(null);
        router.push('/login');
    };

    const switchRole = (newUserData) => {
        setUser(newUserData); 
        router.push('/dashboard'); 
    };

    const contextValue = {
        user,
        isAuthenticated: !!user,
        isAppLoading,
        login,
        logout,
        switchRole,
        activePeriod,
    };

    if (isAppLoading) {
        return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Memuat sistem...</div>;
    }

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    return useContext(AppContext);
}