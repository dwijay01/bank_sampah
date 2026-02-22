import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

const wasteIcons = {
    'Plastik PET': '🧴', 'Plastik HDPE': '🥤', 'Kardus': '📦', 'Kertas HVS': '📄',
    'Besi': '🔩', 'Aluminium': '🥫', 'Kaca/Botol': '🍾', 'Elektronik': '📱',
};

function authFetch(url) {
    const token = localStorage.getItem('auth_token');
    return fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
}

export default function History() {
    const [transactions, setTransactions] = useState([]);
    const [pickups, setPickups] = useState([]);
    const [tab, setTab] = useState('transactions'); // transactions | pickups
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [trxRes, pickupRes] = await Promise.all([
                    authFetch('/api/user/transactions'),
                    authFetch('/api/user/pickup-requests'),
                ]);
                setTransactions(trxRes.data || []);
                setPickups(pickupRes.data || []);
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
                <span>Memuat riwayat...</span>
            </div>
        );
    }

    const statusColor = (s) => {
        if (s === 'Selesai') return 'badge-mini-success';
        if (s === 'Menunggu') return 'badge-mini-warning';
        if (s === 'Dijemput' || s === 'Dikirim') return 'badge-mini-info';
        return 'badge-mini-warning';
    };

    return (
        <div className="mobile-page">
            <h2 className="mobile-page-title">Riwayat</h2>

            {/* Tabs */}
            <div className="mobile-tabs">
                <button className={`mobile-tab ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>
                    Transaksi
                </button>
                <button className={`mobile-tab ${tab === 'pickups' ? 'active' : ''}`} onClick={() => setTab('pickups')}>
                    Penjemputan
                </button>
            </div>

            {tab === 'transactions' && (
                <>
                    {transactions.length === 0 ? (
                        <div className="empty-state">
                            <Package size={40} />
                            <p>Belum ada transaksi</p>
                        </div>
                    ) : (
                        <div className="trx-list">
                            {transactions.map((trx) => (
                                <div key={trx.id} className="trx-item">
                                    <div className="trx-icon">{wasteIcons[trx.waste_type?.name] || '♻️'}</div>
                                    <div className="trx-info">
                                        <span className="trx-type">{trx.service_type} — {trx.waste_type?.name}</span>
                                        <span className="trx-date">{trx.weight_kg} Kg • {new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="trx-right">
                                        <span className="trx-points">+{trx.points_earned}</span>
                                        <span className={`badge-mini ${statusColor(trx.status)}`}>
                                            {trx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'pickups' && (
                <>
                    {pickups.length === 0 ? (
                        <div className="empty-state">
                            <Package size={40} />
                            <p>Belum ada permintaan jemput</p>
                        </div>
                    ) : (
                        <div className="trx-list">
                            {pickups.map((p) => (
                                <div key={p.id} className="trx-item">
                                    <div className="trx-icon">🚛</div>
                                    <div className="trx-info">
                                        <span className="trx-type">{p.waste_description}</span>
                                        <span className="trx-date">{p.address?.substring(0, 30)}{p.address?.length > 30 ? '...' : ''}</span>
                                    </div>
                                    <div className="trx-right">
                                        <span className="trx-points">{p.estimated_weight}</span>
                                        <span className={`badge-mini ${statusColor(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
