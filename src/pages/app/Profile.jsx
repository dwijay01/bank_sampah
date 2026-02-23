import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, ChevronRight, Leaf, Droplets, Cloud, TreePine, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function authFetch(url) {
    const token = localStorage.getItem('auth_token');
    return fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
}

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [ecoInfo, setEcoInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            authFetch('/api/user/profile'),
            authFetch('/api/user/eco-report').catch(() => ({ data: null }))
        ])
            .then(([profRes, ecoRes]) => {
                setProfile(profRes.data);
                if (ecoRes.data) setEcoInfo(ecoRes.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
        } catch (e) {
            // Ignore
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/app/login');
    };

    if (loading) {
        return (
            <div className="mobile-loading">
                <div className="loading-spinner" />
                <span>Memuat profil...</span>
            </div>
        );
    }

    const user = profile || {};
    const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const isWarga = user.role === 'warga';
    const isKurir = user.role === 'kurir';

    return (
        <div className="mobile-page">
            <h2 className="mobile-page-title">Profil</h2>

            {/* Profile Card */}
            <div className="profile-card">
                <div className={`profile-avatar-large ${isKurir ? 'courier-avatar-large' : ''}`}>
                    {isKurir ? '🚛' : initials}
                </div>
                <h3 className="profile-name">{user.name}</h3>
                <span className="profile-level">
                    {isKurir ? '🚛 Kurir LumbungHijau' : `${user.level?.icon || '🌱'} ${user.level?.name || 'Pemula Hijau'}`}
                </span>
            </div>

            {/* Stats Row */}
            {isWarga && (
                <div className="profile-stats">
                    <div className="profile-stat">
                        <span className="profile-stat-value">{(user.eco_points || 0).toLocaleString()}</span>
                        <span className="profile-stat-label">Eco-Points</span>
                    </div>
                    <div className="profile-stat-divider" />
                    <div className="profile-stat">
                        <span className="profile-stat-value">{user.total_kg || 0}</span>
                        <span className="profile-stat-label">Kg Terkumpul</span>
                    </div>
                    <div className="profile-stat-divider" />
                    <div className="profile-stat">
                        <span className="profile-stat-value">{user.total_transactions || 0}</span>
                        <span className="profile-stat-label">Transaksi</span>
                    </div>
                </div>
            )}

            {/* Eco Report Card — Warga Only */}
            {isWarga && ecoInfo && (
                <div className="eco-report-card">
                    <div className="eco-bg-icon">
                        <Leaf size={120} />
                    </div>
                    <h3>
                        <Leaf size={20} /> Rapor Ekologis Anda
                    </h3>

                    <div className="eco-report-grid">
                        <div className="eco-metric">
                            <Droplets size={20} className="metric-icon" style={{ color: '#3B82F6' }} />
                            <span className="eco-metric-label">Air Dihemat</span>
                            <span className="eco-metric-value">{ecoInfo.water_saved_liters} <span>L</span></span>
                        </div>
                        <div className="eco-metric">
                            <Cloud size={20} className="metric-icon" style={{ color: '#9CA3AF' }} />
                            <span className="eco-metric-label">CO2 Turun</span>
                            <span className="eco-metric-value">{ecoInfo.co2_reduced_kg} <span>Kg</span></span>
                        </div>
                        <div className="eco-metric full-width">
                            <div className="metric-icon">
                                <TreePine size={24} />
                            </div>
                            <div>
                                <span className="eco-metric-label">Setara Menanam Pohon</span>
                                <span className="eco-metric-value">{ecoInfo.trees_equivalent} <span>Pohon</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Card — Warga Only */}
            {isWarga && user.qr_token && (
                <div className="qr-card">
                    <div className="qr-card-label">
                        <span>📱</span>
                        <span>QR Code Identitas</span>
                    </div>
                    <div className="qr-code-container">
                        <QRCodeSVG
                            value={`lumbunghijau:user:${user.qr_token}`}
                            size={180}
                            bgColor="#FFFFFF"
                            fgColor="#065F46"
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <p className="qr-card-hint">Tunjukkan QR ini ke kurir saat penjemputan sampah</p>
                </div>
            )}

            {/* Info items */}
            <div className="profile-section">
                {isWarga && (
                    <div className="profile-item" onClick={() => navigate('/app/vouchers')} style={{ cursor: 'pointer', background: '#F0FDF4' }}>
                        <Ticket size={18} className="text-emerald-600" />
                        <div className="profile-item-content">
                            <span className="profile-item-label" style={{ color: '#059669', fontWeight: 'bold' }}>Dompet Voucher</span>
                            <span className="profile-item-value" style={{ fontSize: '0.75rem' }}>Lihat voucher yang siap ditukar</span>
                        </div>
                        <ChevronRight size={18} className="profile-item-arrow" />
                    </div>
                )}

                <div className="profile-item">
                    <Mail size={18} />
                    <div className="profile-item-content">
                        <span className="profile-item-label">Email</span>
                        <span className="profile-item-value">{user.email}</span>
                    </div>
                    <ChevronRight size={18} className="profile-item-arrow" />
                </div>
                <div className="profile-item">
                    <Phone size={18} />
                    <div className="profile-item-content">
                        <span className="profile-item-label">WhatsApp</span>
                        <span className="profile-item-value">{user.phone || '-'}</span>
                    </div>
                    <ChevronRight size={18} className="profile-item-arrow" />
                </div>
                <div className="profile-item">
                    <User size={18} />
                    <div className="profile-item-content">
                        <span className="profile-item-label">Peran</span>
                        <span className="profile-item-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
                Keluar dari Akun
            </button>
        </div>
    );
}
