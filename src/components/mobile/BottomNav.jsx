import { NavLink } from 'react-router-dom';
import { Home, Clock, User, Truck } from 'lucide-react';

const wargaNav = [
    { to: '/app', label: 'Beranda', icon: Home },
    { to: '/app/history', label: 'Riwayat', icon: Clock },
    { to: '/app/profile', label: 'Profil', icon: User },
];

const kurirNav = [
    { to: '/app/courier', label: 'Tugas', icon: Truck },
    { to: '/app/history', label: 'Riwayat', icon: Clock },
    { to: '/app/profile', label: 'Profil', icon: User },
];

export default function BottomNav({ role }) {
    const items = role === 'kurir' ? kurirNav : wargaNav;

    return (
        <nav className="bottom-nav">
            {items.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/app' || item.to === '/app/courier'}
                    className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    <item.icon size={22} />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
