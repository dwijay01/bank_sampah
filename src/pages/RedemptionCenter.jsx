import { useState, useEffect } from 'react';
import { QrCode, Search, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function RedemptionCenter() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanToken, setScanToken] = useState('');

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const res = await fetch('/api/admin/vouchers');
            const data = await res.json();
            setVouchers(data.data || []);
        } catch (error) {
            console.error('Failed to fetch vouchers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualScan = async (e) => {
        e.preventDefault();
        if (!scanToken.trim()) return;

        setScanLoading(true);
        try {
            // Kita extract token jika inputnya berupa URL lumbunghijau:voucher:XYZ
            let cleanToken = scanToken.trim();
            if (cleanToken.includes('lumbunghijau:voucher:')) {
                cleanToken = cleanToken.split('lumbunghijau:voucher:')[1];
            }

            const res = await fetch('/api/admin/vouchers/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ qr_code_token: cleanToken })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Verifikasi gagal');

            alert(`✅ BERHASIL!\n\nWarga: ${data.data.user_name}\nBarang: ${data.data.reward_name}\n\nSilakan berikan barang kepada warga.`);
            setScanToken('');
            fetchVouchers(); // Refresh tabel
        } catch (error) {
            alert(`❌ GAGAL: ${error.message}`);
        } finally {
            setScanLoading(false);
        }
    };

    return (
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Pusat Penukaran</h1>
                    <p>Pantau antrean voucher warga & verifikasi penukaran secara manual</p>
                </div>

                {/* Manual Scan Box */}
                <div className="floating-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <QrCode size={16} /> Scan QR Voucher (Manual)
                    </h3>
                    <form onSubmit={handleManualScan} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Klik ID Scanner disini..."
                            value={scanToken}
                            onChange={(e) => setScanToken(e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                        />
                        <button type="submit" className="btn btn-emerald" disabled={scanLoading || !scanToken.trim()} style={{ padding: '8px 16px' }}>
                            {scanLoading ? '...' : 'Proses'}
                        </button>
                    </form>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>*Gunakan barcode scanner USB atau copas token dari aplikasi warga.</span>
                </div>
            </div>

            <div className="floating-card data-table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Waktu Klaim</th>
                            <th>Warga Pemilik</th>
                            <th>Hadiah Ditukar</th>
                            <th>Kode Tiket</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Belum ada satupun warga yang menukar poinnya.
                                </td>
                            </tr>
                        ) : (
                            vouchers.map((voucher) => (
                                <tr key={voucher.id}>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(voucher.created_at).toLocaleString('id-ID')}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{voucher.user?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{voucher.user?.phone || voucher.user?.email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--emerald-dark)' }}>{voucher.reward?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{voucher.reward?.points_cost} Pt</div>
                                    </td>
                                    <td>
                                        <code style={{ background: 'var(--bg)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text)' }}>
                                            {voucher.qr_code_token.substring(0, 12)}...
                                        </code>
                                    </td>
                                    <td>
                                        {voucher.status === 'Aktif' ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#FEF3C7', color: '#D97706' }}>
                                                <Clock size={12} /> Menunggu Ambil
                                            </span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--emerald-light)', color: 'var(--emerald-dark)' }}>
                                                <CheckCircle size={12} /> Selesai ({new Date(voucher.used_at).toLocaleDateString()})
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
