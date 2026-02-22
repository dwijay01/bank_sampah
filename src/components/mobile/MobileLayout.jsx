import { Navigate, Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function MobileLayout() {
    const token = localStorage.getItem('auth_token');
    if (!token) return <Navigate to="/app/login" replace />;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'warga';

    // Redirect kurir to courier home if they hit /app
    if (role === 'kurir' && window.location.pathname === '/app') {
        return <Navigate to="/app/courier" replace />;
    }

    return (
        <div className="mobile-layout">
            <div className="mobile-content">
                <Outlet />
            </div>
            <BottomNav role={role} />
        </div>
    );
}
