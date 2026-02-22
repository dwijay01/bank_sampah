import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Plus, Store } from 'lucide-react';
import { getWithdrawalRequests, approveWithdrawal, rejectWithdrawal, getWarungPartners, createWarungPartner } from '../services/api';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function WithdrawalTab() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getWithdrawalRequests()
            .then((res) => setRequests(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') {
                await approveWithdrawal(id);
            } else {
                await rejectWithdrawal(id);
            }
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, status: action === 'approve' ? 'Disetujui' : 'Ditolak' } : r
                )
            );
        } catch (err) {
            console.error('Withdrawal action error:', err);
        }
    };

    const statusBadge = (status) => {
        const map = {
            'Menunggu': 'badge-warning',
            'Disetujui': 'badge-success',
            'Ditolak': 'badge-danger',
        };
        return map[status] || 'badge-info';
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data...</div>;

    return (
        <div className="floating-card data-table-card">
            <div className="data-table-header">
                <h3>Permintaan Pencairan</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {requests.filter((r) => r.status === 'Menunggu').length} menunggu persetujuan
                </span>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama</th>
                        <th>Poin</th>
                        <th>Jumlah</th>
                        <th>Metode</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.id}>
                            <td style={{ fontWeight: 600, color: '#64748B', fontSize: '0.8rem' }}>WD-{String(req.id).padStart(3, '0')}</td>
                            <td style={{ fontWeight: 600 }}>{req.user?.name || '-'}</td>
                            <td>{req.points?.toLocaleString()}</td>
                            <td style={{ fontWeight: 600, color: 'var(--emerald-dark)' }}>{req.amount}</td>
                            <td>{req.method}</td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{req.created_at?.split('T')[0]}</td>
                            <td>
                                <span className={`badge ${statusBadge(req.status)}`}>{req.status}</span>
                            </td>
                            <td>
                                {req.status === 'Menunggu' ? (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            className="btn btn-emerald btn-sm"
                                            onClick={() => handleAction(req.id, 'approve')}
                                        >
                                            <CheckCircle size={14} /> Setujui
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleAction(req.id, 'reject')}
                                        >
                                            <XCircle size={14} /> Tolak
                                        </button>
                                    </div>
                                ) : (
                                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PartnerTab() {
    const [partners, setPartners] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newPartner, setNewPartner] = useState({ name: '', address: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getWarungPartners()
            .then((res) => setPartners(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleAdd = async () => {
        if (!newPartner.name || !newPartner.address) return;
        try {
            const res = await createWarungPartner(newPartner);
            setPartners([...partners, res.data]);
            setNewPartner({ name: '', address: '' });
            setShowForm(false);
        } catch (err) {
            console.error('Add partner error:', err);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data...</div>;

    return (
        <div>
            <div className="floating-card data-table-card" style={{ marginBottom: 20 }}>
                <div className="data-table-header">
                    <h3>Mitra Warung</h3>
                    <button className="btn btn-emerald btn-sm" onClick={() => setShowForm(!showForm)}>
                        <Plus size={14} /> Tambah Mitra
                    </button>
                </div>

                {showForm && (
                    <div
                        style={{
                            padding: 20,
                            background: 'var(--emerald-50)',
                            borderRadius: 12,
                            marginBottom: 20,
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-end',
                        }}
                    >
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label>Nama Warung</label>
                            <input
                                className="form-input"
                                placeholder="Nama warung"
                                value={newPartner.name}
                                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label>Alamat</label>
                            <input
                                className="form-input"
                                placeholder="Alamat warung"
                                value={newPartner.address}
                                onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                            />
                        </div>
                        <button className="btn btn-emerald" onClick={handleAdd}>
                            Simpan
                        </button>
                    </div>
                )}

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama Warung</th>
                            <th>Alamat</th>
                            <th>Voucher Tertukar</th>
                            <th>Bergabung</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.map((p) => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 600, color: '#64748B', fontSize: '0.8rem' }}>WR-{String(p.id).padStart(3, '0')}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                background: 'var(--orange-light)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Store size={16} color="var(--orange)" />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.82rem' }}>{p.address}</td>
                                <td style={{ fontWeight: 600, color: 'var(--orange)' }}>{p.vouchers_redeemed}</td>
                                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.join_date?.split('T')[0]}</td>
                                <td>
                                    <span className={`badge ${p.status === 'Aktif' ? 'badge-success' : 'badge-danger'}`}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const tabs = [
    { id: 'withdrawal', label: 'Pencairan' },
    { id: 'partners', label: 'Mitra Warung' },
];

export default function Wallet() {
    const [activeTab, setActiveTab] = useState('withdrawal');

    return (
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="page-header">
                <h1>Dompet Hijau & Mitra</h1>
                <p>Kelola pencairan eco-points dan kemitraan warung</p>
            </div>

            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'withdrawal' && <WithdrawalTab />}
            {activeTab === 'partners' && <PartnerTab />}
        </motion.div>
    );
}
