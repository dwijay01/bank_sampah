import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ArrowRight, Truck, MapPin, ChevronRight } from 'lucide-react';

const API_BASE = '/api';

function authFetch(url) {
    const token = localStorage.getItem('auth_token');
    return fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
}

const wasteIcons = {
    'Plastik PET': '🧴',
    'Plastik HDPE': '🥤',
    'Kardus': '📦',
    'Kertas HVS': '📄',
    'Besi': '🔩',
    'Aluminium': '🥫',
    'Kaca/Botol': '🍾',
    'Elektronik': '📱',
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Home() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [wasteTypes, setWasteTypes] = useState([]);
    const [recentTrx, setRecentTrx] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileRes, wasteRes, trxRes] = await Promise.all([
                    authFetch('/api/user/profile'),
                    fetch('/api/waste-types', { headers: { Accept: 'application/json' } }).then(r => r.json()),
                    authFetch('/api/user/transactions'),
                ]);
                setProfile(profileRes.data);
                setWasteTypes(wasteRes.data || []);
                setRecentTrx((trxRes.data || []).slice(0, 2));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="mobile-loading">
                <div className="loading-spinner" />
                <span>Memuat...</span>
            </div>
        );
    }

    const user = profile || {};
    const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <motion.div className="mobile-page" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
            {/* Header */}
            <motion.div className="mobile-header" variants={fadeUp}>
                <div className="mobile-header-left">
                    <div className="mobile-avatar">{initials}</div>
                    <div>
                        <p className="mobile-greeting">Halo, {user.name?.split(' ')[0] || 'Warga'}! 👋</p>
                        <p className="mobile-level">{user.level?.icon || '🌱'} {user.level?.name || 'Pemula Hijau'}</p>
                    </div>
                </div>
                <button className="mobile-notif-btn">
                    <Bell size={22} />
                    <span className="mobile-notif-dot" />
                </button>
            </motion.div>

            {/* Balance Card */}
            <motion.div className="balance-card" variants={fadeUp}>
                <div className="balance-card-inner">
                    <p className="balance-label">Saldo Eco-Points</p>
                    <h2 className="balance-value">{(user.eco_points || 0).toLocaleString()}</h2>
                    <div className="balance-stats">
                        <span>📦 {user.total_kg || 0} Kg terkumpul</span>
                        <span>🔄 {user.total_transactions || 0} transaksi</span>
                    </div>
                </div>
                <button className="balance-redeem-btn" onClick={() => navigate('/app/profile')}>
                    Tukar Poin <ArrowRight size={16} />
                </button>
            </motion.div>

            {/* Action Buttons */}
            <motion.div className="action-grid" variants={fadeUp}>
                <button className="action-card" onClick={() => navigate('/app/dropoff')}>
                    <div className="action-icon action-icon-green">
                        <MapPin size={28} />
                    </div>
                    <span className="action-label">Antar ke Posko</span>
                    <span className="action-sub">Drop-off langsung</span>
                </button>
                <button className="action-card action-card-accent" onClick={() => navigate('/app/pickup')}>
                    <div className="action-icon action-icon-orange">
                        <Truck size={28} />
                    </div>
                    <span className="action-label">Jemput ke Rumah</span>
                    <span className="action-sub">Kurir datang ke Anda</span>
                </button>
            </motion.div>

            {/* Waste Prices Slider */}
            <motion.div variants={fadeUp}>
                <h3 className="section-title">💰 Harga Sampah Hari Ini</h3>
                <div className="price-slider">
                    {wasteTypes.map((wt) => (
                        <div key={wt.id} className="price-card">
                            <span className="price-icon">{wasteIcons[wt.name] || '♻️'}</span>
                            <span className="price-name">{wt.name}</span>
                            <span className="price-value">Rp {wt.price_per_kg?.toLocaleString()}/Kg</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div variants={fadeUp}>
                <div className="section-header">
                    <h3 className="section-title">📋 Riwayat Terakhir</h3>
                    <button className="section-link" onClick={() => navigate('/app/history')}>
                        Lihat Semua <ChevronRight size={16} />
                    </button>
                </div>
                {recentTrx.length === 0 ? (
                    <div className="empty-state">
                        <p>Belum ada transaksi. Yuk mulai setor sampah! ♻️</p>
                    </div>
                ) : (
                    <div className="trx-list">
                        {recentTrx.map((trx) => (
                            <div key={trx.id} className="trx-item">
                                <div className="trx-icon">{wasteIcons[trx.waste_type?.name] || '♻️'}</div>
                                <div className="trx-info">
                                    <span className="trx-type">{trx.service_type} — {trx.waste_type?.name}</span>
                                    <span className="trx-date">{trx.weight_kg} Kg • {new Date(trx.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="trx-right">
                                    <span className="trx-points">+{trx.points_earned}</span>
                                    <span className={`badge-mini ${trx.status === 'Selesai' ? 'badge-mini-success' : 'badge-mini-warning'}`}>
                                        {trx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
