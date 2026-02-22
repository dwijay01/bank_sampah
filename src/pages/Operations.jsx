import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, ClipboardCheck, DollarSign, Save, QrCode, FileText } from 'lucide-react';
import { getPickupRequests, getCouriers, assignCourier, getWasteTypes, updateWasteType, createTransaction } from '../services/api';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function CourierTab() {
    const [requests, setRequests] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [selectedCourier, setSelectedCourier] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [reqRes, courierRes] = await Promise.all([
                    getPickupRequests(),
                    getCouriers(),
                ]);
                setRequests(reqRes.data);
                setCouriers(courierRes.data);
            } catch (err) {
                console.error('CourierTab fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleAssign = async (id) => {
        const courierId = selectedCourier[id];
        if (!courierId) return;
        try {
            const res = await assignCourier(id, courierId);
            setRequests((prev) =>
                prev.map((r) => (r.id === id ? res.data : r))
            );
        } catch (err) {
            console.error('Assign error:', err);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data...</div>;

    return (
        <div className="floating-card data-table-card">
            <div className="data-table-header">
                <h3>Penugasan Kurir</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {requests.filter((r) => r.status === 'Menunggu').length} permintaan menunggu
                </span>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Pemohon</th>
                        <th>Alamat</th>
                        <th>Jenis Sampah</th>
                        <th>Est. Berat</th>
                        <th>Kurir</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.id}>
                            <td style={{ fontWeight: 600, color: '#64748B', fontSize: '0.8rem' }}>PU-{String(req.id).padStart(3, '0')}</td>
                            <td style={{ fontWeight: 600 }}>{req.user?.name || '-'}</td>
                            <td style={{ fontSize: '0.82rem', maxWidth: 200 }}>{req.address}</td>
                            <td>{req.waste_description}</td>
                            <td>{req.estimated_weight}</td>
                            <td>
                                {req.status === 'Menunggu' ? (
                                    <select
                                        className="form-select"
                                        style={{ width: 130, padding: '6px 10px', fontSize: '0.82rem' }}
                                        value={selectedCourier[req.id] || ''}
                                        onChange={(e) => setSelectedCourier({ ...selectedCourier, [req.id]: e.target.value })}
                                    >
                                        <option value="">Pilih Kurir</option>
                                        {couriers.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span style={{ fontWeight: 500 }}>{req.courier?.name || '-'}</span>
                                )}
                            </td>
                            <td>
                                <span className={`badge ${req.status === 'Menunggu' ? 'badge-warning' : req.status === 'Ditugaskan' ? 'badge-info' : 'badge-success'}`}>
                                    {req.status}
                                </span>
                            </td>
                            <td>
                                {req.status === 'Menunggu' && (
                                    <button className="btn btn-emerald btn-sm" onClick={() => handleAssign(req.id)}>
                                        <UserCheck size={14} /> Tugaskan
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DropoffTab() {
    const [wasteTypes, setWasteTypes] = useState([]);
    const [weight, setWeight] = useState('');
    const [wasteType, setWasteType] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    useEffect(() => {
        getWasteTypes().then((res) => setWasteTypes(res.data)).catch(console.error);
    }, []);

    const handleGenerate = async () => {
        if (!weight || !wasteType) return;
        try {
            const res = await createTransaction({
                user_id: 2, // demo user
                waste_type_id: parseInt(wasteType),
                service_type: 'Drop-off',
                weight_kg: parseFloat(weight),
            });
            setInvoiceData(res.data);
            setShowInvoice(true);
        } catch (err) {
            console.error('Create transaction error:', err);
        }
    };

    const selectedType = wasteTypes.find((wt) => wt.id === parseInt(wasteType));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="floating-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Verifikasi Drop-off</h3>
                <div className="form-group">
                    <label>Jenis Sampah</label>
                    <select className="form-select" value={wasteType} onChange={(e) => setWasteType(e.target.value)}>
                        <option value="">Pilih jenis sampah</option>
                        {wasteTypes.map((wt) => (
                            <option key={wt.id} value={wt.id}>{wt.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Berat (Kg)</label>
                    <input
                        className="form-input"
                        type="number"
                        placeholder="Masukkan berat"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Scan QR Warga</label>
                    <div
                        style={{
                            border: '2px dashed var(--border)',
                            borderRadius: 12,
                            padding: 40,
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            background: 'var(--bg)',
                        }}
                    >
                        <QrCode size={40} style={{ marginBottom: 8, opacity: 0.4 }} />
                        <p style={{ fontSize: '0.85rem' }}>Arahkan kamera ke QR code warga</p>
                    </div>
                </div>
                <button className="btn btn-emerald" style={{ width: '100%' }} onClick={handleGenerate}>
                    <FileText size={16} /> Generate Invoice
                </button>
            </div>

            <div className="floating-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showInvoice && invoiceData ? (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div
                            style={{
                                background: 'var(--emerald-light)',
                                borderRadius: 12,
                                padding: 32,
                                marginBottom: 16,
                            }}
                        >
                            <h3 style={{ color: 'var(--emerald-dark)', fontSize: '1.1rem', marginBottom: 12 }}>Invoice Drop-off</h3>
                            <p style={{ fontSize: '0.88rem', marginBottom: 4 }}>
                                <strong>Jenis:</strong> {selectedType?.name || wasteType}
                            </p>
                            <p style={{ fontSize: '0.88rem', marginBottom: 4 }}>
                                <strong>Berat:</strong> {invoiceData.weight_kg} Kg
                            </p>
                            <p style={{ fontSize: '0.88rem', marginBottom: 4 }}>
                                <strong>Poin diterima:</strong> {invoiceData.points_earned?.toLocaleString()} Eco-Points
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
                                ID: INV-{String(invoiceData.id).padStart(6, '0')}
                            </p>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => { setShowInvoice(false); setWeight(''); setWasteType(''); }}>
                            Transaksi Baru
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <ClipboardCheck size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                        <p style={{ fontSize: '0.88rem' }}>Invoice akan tampil di sini</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PriceTab() {
    const [prices, setPrices] = useState([]);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getWasteTypes()
            .then((res) => setPrices(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (id, newPrice) => {
        try {
            const res = await updateWasteType(id, Number(newPrice));
            setPrices((prev) => prev.map((p) => (p.id === id ? res.data : p)));
        } catch (err) {
            console.error('Update price error:', err);
        }
        setEditing(null);
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data...</div>;

    return (
        <div className="floating-card data-table-card">
            <div className="data-table-header">
                <h3>Katalog Harga Sampah</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {prices.length} jenis terdaftar
                </span>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Jenis Sampah</th>
                        <th>Harga / Kg</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {prices.map((item, idx) => (
                        <tr key={item.id}>
                            <td>{idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                            <td>
                                {editing === item.id ? (
                                    <input
                                        className="inline-edit-input"
                                        type="number"
                                        defaultValue={item.price_per_kg}
                                        autoFocus
                                        onBlur={(e) => handleSave(item.id, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id, e.target.value)}
                                    />
                                ) : (
                                    <span style={{ fontWeight: 600, color: 'var(--emerald-dark)' }}>
                                        Rp {item.price_per_kg?.toLocaleString()}
                                    </span>
                                )}
                            </td>
                            <td>
                                {editing === item.id ? (
                                    <button className="btn btn-emerald btn-sm" onClick={() => setEditing(null)}>
                                        <Save size={14} /> Simpan
                                    </button>
                                ) : (
                                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(item.id)}>
                                        Edit
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const tabs = [
    { id: 'courier', label: 'Penugasan Kurir' },
    { id: 'dropoff', label: 'Verifikasi Drop-off' },
    { id: 'prices', label: 'Katalog Harga' },
];

export default function Operations() {
    const [activeTab, setActiveTab] = useState('courier');

    return (
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="page-header">
                <h1>Manajemen Operasional</h1>
                <p>Kelola kurir, verifikasi setoran, dan harga sampah</p>
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

            {activeTab === 'courier' && <CourierTab />}
            {activeTab === 'dropoff' && <DropoffTab />}
            {activeTab === 'prices' && <PriceTab />}
        </motion.div>
    );
}
