import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, MapPin, ChevronRight, Clock } from 'lucide-react';

function authFetch(url) {
    const token = localStorage.getItem('auth_token');
    return fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
}

const statusConfig = {
    'Ditugaskan': { label: 'Siap Jemput', color: 'badge-mini-warning', icon: '📋' },
    'Dijemput': { label: 'Sedang Proses', color: 'badge-mini-info', icon: '📦' },
    'Selesai': { label: 'Selesai', color: 'badge-mini-success', icon: '✅' },
};

export default function CourierHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, assignRes] = await Promise.all([
                    authFetch('/api/courier/stats'),
                    authFetch('/api/courier/assignments'),
                ]);
                setStats(statsRes.data || {});
                setAssignments(assignRes.data || []);
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
                <span>Memuat data kurir...</span>
            </div>
        );
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = (user.name || 'Kurir').split(' ').pop();

    const activeAssignments = assignments.filter(a => a.status !== 'Selesai');
    const completedAssignments = assignments.filter(a => a.status === 'Selesai');

    return (
        <div className="mobile-page">
            {/* Header */}
            <div className="mobile-header">
                <div className="mobile-header-left">
                    <div className="mobile-avatar courier-avatar">🚛</div>
                    <div>
                        <div className="mobile-greeting">Halo, {firstName}!</div>
                        <div className="mobile-level">Kurir LumbungHijau</div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="courier-stats-grid">
                <div className="courier-stat-card">
                    <span className="courier-stat-icon">📦</span>
                    <span className="courier-stat-value">{stats?.today_completed || 0}</span>
                    <span className="courier-stat-label">Hari Ini</span>
                </div>
                <div className="courier-stat-card">
                    <span className="courier-stat-icon">⚖️</span>
                    <span className="courier-stat-value">{stats?.today_kg || 0}</span>
                    <span className="courier-stat-label">Kg Hari Ini</span>
                </div>
                <div className="courier-stat-card">
                    <span className="courier-stat-icon">📋</span>
                    <span className="courier-stat-value">{stats?.pending_assignments || 0}</span>
                    <span className="courier-stat-label">Menunggu</span>
                </div>
                <div className="courier-stat-card">
                    <span className="courier-stat-icon">🏆</span>
                    <span className="courier-stat-value">{stats?.total_completed || 0}</span>
                    <span className="courier-stat-label">Total Jemput</span>
                </div>
            </div>

            {/* Active Assignments */}
            <div className="section-header" style={{ marginTop: 8 }}>
                <h3 className="section-title">🚀 Tugas Aktif</h3>
                <span className="courier-badge-count">{activeAssignments.length}</span>
            </div>

            {activeAssignments.length === 0 ? (
                <div className="empty-state">
                    <Truck size={40} />
                    <p>Tidak ada tugas aktif saat ini</p>
                </div>
            ) : (
                <div className="trx-list">
                    {activeAssignments.map((a) => {
                        const cfg = statusConfig[a.status] || statusConfig['Ditugaskan'];
                        return (
                            <div
                                key={a.id}
                                className="courier-assignment-card"
                                onClick={() => {
                                    if (a.status === 'Ditugaskan') {
                                        navigate(`/app/courier/scan/${a.id}`);
                                    }
                                }}
                            >
                                <div className="courier-card-header">
                                    <div className="courier-card-left">
                                        <span className="courier-card-icon">{cfg.icon}</span>
                                        <div>
                                            <span className="courier-card-name">{a.user?.name || 'Warga'}</span>
                                            <span className={`badge-mini ${cfg.color}`}>{cfg.label}</span>
                                        </div>
                                    </div>
                                    {a.status === 'Ditugaskan' && <ChevronRight size={20} className="profile-item-arrow" />}
                                </div>
                                <div className="courier-card-detail">
                                    <MapPin size={14} />
                                    <span>{a.address}</span>
                                </div>
                                <div className="courier-card-detail">
                                    <Package size={14} />
                                    <span>{a.waste_description} • Est. {a.estimated_weight}</span>
                                </div>
                                {a.status === 'Ditugaskan' && (
                                    <div className="courier-card-action">
                                        <span>Tap untuk scan QR warga</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Completed */}
            {completedAssignments.length > 0 && (
                <>
                    <h3 className="section-title" style={{ marginTop: 24 }}>✅ Selesai Hari Ini</h3>
                    <div className="trx-list">
                        {completedAssignments.slice(0, 3).map((a) => (
                            <div key={a.id} className="trx-item" style={{ opacity: 0.7 }}>
                                <div className="trx-icon">✅</div>
                                <div className="trx-info">
                                    <span className="trx-type">{a.user?.name}</span>
                                    <span className="trx-date">{a.actual_weight} Kg • {a.waste_description}</span>
                                </div>
                                <div className="trx-right">
                                    <span className="trx-points">+{a.points_earned} pts</span>
                                    <span className="badge-mini badge-mini-success">Selesai</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
