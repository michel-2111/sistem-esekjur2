// components/Layout.js
import Header from './Header';
import SideBar from './Sidebar';
import { useState } from 'react';

export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const sidebarWidth = collapsed ? 68 : 228;

    return (
        <div className="min-h-screen bg-gray-100" style={{ display: 'flex' }}>

            <SideBar 
                collapsed={collapsed} 
                onToggle={() => setCollapsed(c => !c)}
            />

            <div
                style={{
                    marginLeft: sidebarWidth,
                    flex: 1,
                    minWidth: 0,
                    transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Header />
                <main className="container mx-auto p-6">
                    {children}
                </main>
            </div>

        </div>
    );
}