import { Search, Bell, Menu } from 'lucide-react';

export default function TopBar({ title, onMenuClick }) {
    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="hamburger-btn" onClick={onMenuClick}>
                    <Menu size={22} />
                </button>
                <h2>{title}</h2>
            </div>

            <div className="topbar-right">
                <div className="topbar-search">
                    <Search />
                    <input type="text" placeholder="Cari transaksi, warga..." />
                </div>

                <button className="notif-btn" id="notification-bell">
                    <Bell size={22} />
                    <span className="notif-badge" />
                </button>

                <div className="admin-profile">
                    <div className="admin-avatar">AD</div>
                    <div className="admin-info">
                        <span>Admin Desa</span>
                        <span>Super Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
