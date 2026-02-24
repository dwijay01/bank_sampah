import { useState, useEffect } from 'react';
import { Store, UserPlus, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PartnerHub() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state untuk nambah Warung
    const [formData, setFormData] = useState({
        store_name: '',
        owner_name: '',
        address: '',
        phone: '',
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await fetch('/api/admin/partners');
            const data = await res.json();
            setPartners(data.data || []);
        } catch (error) {
            console.error('Failed to fetch partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/admin/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menambahkan mitra');

            await fetchPartners();
            setIsModalOpen(false);
            setFormData({ store_name: '', owner_name: '', address: '', phone: '', email: '', password: '' });
            alert('Mitra Warung berhasil ditambahkan! Akun login telah dibuat.');
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Mitra Warung</h1>
                    <p>Kelola jaringan warung lokal tempat warga menukar sembako</p>
                </div>
                <button className="btn btn-emerald" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={18} /> Daftarkan Warung
                </button>
            </div>

            {/* Rekap Tagihan Beban (Opsional) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="floating-card" style={{ padding: '20px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Total Warung Terdaftar</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-dark)' }}>{partners.length} Mitra</div>
                </div>
                <div className="floating-card" style={{ padding: '20px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Total Pencairan (Tagihan)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C2410C' }}>
                        Rp {partners.reduce((sum, p) => sum + p.total_billing_estimate, 0).toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="floating-card" style={{ padding: '20px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Total Transaksi Penukaran</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563EB' }}>
                        {partners.reduce((sum, p) => sum + p.completed_transactions, 0)} Transaksi
                    </div>
                </div>
            </div>

            <div className="floating-card data-table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Profil Warung</th>
                            <th>Kontak & Akun</th>
                            <th>Lokasi</th>
                            <th>Voucher Diproses</th>
                            <th align="right">Estimasi Tagihan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Memuat data...</td>
                            </tr>
                        ) : partners.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Belum ada Mitra Warung yang terdaftar.
                                </td>
                            </tr>
                        ) : (
                            partners.map((partner) => (
                                <tr key={partner.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--emerald-50)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{partner.store_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Milik: {partner.owner_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Phone size={12} color="var(--text-muted)" /> {partner.user?.phone}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{partner.user?.email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: '6px', maxWidth: '200px' }}>
                                            <MapPin size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <span style={{ lineHeight: 1.3 }}>{partner.address}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                                            {partner.completed_transactions} Item
                                        </div>
                                    </td>
                                    <td align="right">
                                        <div style={{ fontWeight: 800, color: '#C2410C', fontSize: '1rem' }}>
                                            Rp {partner.total_billing_estimate?.toLocaleString('id-ID')}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah Mitra */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }}
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="floating-card"
                            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '500px', zIndex: 101, padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Registrasi Mitra Warung</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Akun untuk login aplikasi Mitra akan otomatis dibuatkan.</p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Nama Warung/Toko</label>
                                        <input type="text" required value={formData.store_name} onChange={(e) => setFormData({ ...formData, store_name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }} placeholder="Cth: Warung Ibu Tejo" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Nama Pemilik</label>
                                        <input type="text" required value={formData.owner_name} onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }} placeholder="Cth: Siti Aminah" />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Alamat Lengkap</label>
                                    <textarea required rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', resize: 'vertical' }} placeholder="Alamat warung beroperasi..." />
                                </div>

                                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)' }}>KREDENSIAL LOGIN MITRA</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>No WhatsApp</label>
                                            <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>Email</label>
                                            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>Password Login</label>
                                        <input type="password" required minLength="6" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Batal</button>
                                    <button type="submit" className="btn btn-emerald" disabled={isSubmitting}>
                                        {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Mitra'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
