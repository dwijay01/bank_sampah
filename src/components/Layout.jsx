import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageTitles = {
    '/admin': 'Pusat Kendali Analitik',
    '/admin/operations': 'Manajemen Operasional',
    '/admin/wallet': 'Dompet Hijau & Mitra',
    '/admin/gamification': 'Gamifikasi',
};

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Dashboard';

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-area">
                <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
