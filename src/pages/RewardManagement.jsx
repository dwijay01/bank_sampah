import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Archive, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function RewardManagement() {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        points_cost: '',
        stock: '',
        is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const res = await fetch('/api/admin/rewards');
            const data = await res.json();
            setRewards(data.data || []);
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (reward = null) => {
        if (reward) {
            setEditingId(reward.id);
            setFormData({
                name: reward.name,
                description: reward.description || '',
                points_cost: reward.points_cost,
                stock: reward.stock,
                is_active: reward.is_active === 1 || reward.is_active === true
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', description: '', points_cost: '', stock: '', is_active: true });
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('points_cost', formData.points_cost);
            submitData.append('stock', formData.stock);
            // Laravel requires 'is_active' to be 1 or 0 for boolean fields sometimes, but 'true'/'false' works with validation
            submitData.append('is_active', formData.is_active ? '1' : '0');

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            let url = '/api/admin/rewards';
            let method = 'POST';

            if (editingId) {
                // Laravel handles PUT with FormData using _method=PUT
                url = `/api/admin/rewards/${editingId}`;
                submitData.append('_method', 'PUT');
            }

            const res = await fetch(url, {
                method: 'POST', // Always POST for FormData in Laravel if we use _method
                body: submitData
            });

            if (!res.ok) throw new Error('Failed to save reward');

            await fetchRewards();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus hadiah ini dari katalog?')) return;

        try {
            const res = await fetch(`/api/admin/rewards/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) throw new Error('Failed to delete');
            await fetchRewards();
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <span style={{ color: 'var(--text-muted)' }}>Memuat katalog hadiah...</span>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Katalog Hadiah</h1>
                    <p>Kelola barang sembako atau voucher untuk ditukar oleh Warga</p>
                </div>
                <button className="btn btn-emerald" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Tambah Barang Baru
                </button>
            </div>

            <div className="floating-card data-table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Barang</th>
                            <th>Harga Poin</th>
                            <th>Stok</th>
                            <th>Status</th>
                            <th align="right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rewards.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Katalog belanja masih kosong. Mulai tambahkan hadiah baru!
                                </td>
                            </tr>
                        ) : (
                            rewards.map((reward) => (
                                <tr key={reward.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                                {reward.image_url ? (
                                                    <img src={reward.image_url} alt={reward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <ImageIcon size={20} color="var(--text-muted)" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{reward.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{reward.description?.substring(0, 40)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-dark)', fontWeight: 700 }}>
                                            <Tag size={14} /> {reward.points_cost} Pt
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: reward.stock > 0 ? 'var(--text)' : 'red' }}>
                                            <Archive size={14} /> {reward.stock} {reward.stock <= 0 && '(Habis)'}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: reward.is_active ? 'var(--emerald-light)' : '#FEE2E2',
                                            color: reward.is_active ? 'var(--emerald-dark)' : '#DC2626'
                                        }}>
                                            {reward.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td align="right">
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(reward)}>
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button className="btn btn-outline btn-sm" style={{ color: '#DC2626', borderColor: '#FECACA' }} onClick={() => handleDelete(reward.id)}>
                                                <Trash2 size={14} /> Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
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
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                                {editingId ? 'Edit Hadiah' : 'Tambah Hadiah Baru'}
                            </h2>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Nama Barang</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                                        placeholder="Cth: Beras Premium 2.5 Kg"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Harga (Poin)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.points_cost}
                                            onChange={(e) => setFormData({ ...formData, points_cost: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Stok Tersedia</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Deskripsi Pendek</label>
                                    <textarea
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem', resize: 'vertical' }}
                                        placeholder="Cth: Beras putih rojolele."
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Foto Barang (Opsional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px dashed #CBD5E1', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <label htmlFor="isActive" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Aktif (Tampilkan di Toko Poin Warga)</label>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn btn-emerald" disabled={isSubmitting}>
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Barang'}
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
