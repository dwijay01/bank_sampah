import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Wallet, Gamepad2, Recycle, X } from 'lucide-react';

const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/operations', label: 'Operasional', icon: Truck },
    { to: '/admin/wallet', label: 'Dompet Hijau', icon: Wallet },
    { to: '/admin/gamification', label: 'Gamifikasi', icon: Gamepad2 },
];

export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <h1>
                        <span className="logo-icon"><Recycle size={20} /></span>
                        LumbungHijau
                    </h1>
                    <p>Bank Sampah Digital</p>
                    <button
                        className="hamburger-btn"
                        onClick={onClose}
                        style={{ position: 'absolute', top: 20, right: 16, color: '#fff' }}
                    >
                        <X size={22} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin'}
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={onClose}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <p>© 2026 LumbungHijau v1.0</p>
                </div>
            </aside>
        </>
    );
}
