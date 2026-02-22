import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin, Check } from 'lucide-react';

const wasteIcons = {
    'Plastik PET': '🧴', 'Plastik HDPE': '🥤', 'Kardus': '📦', 'Kertas HVS': '📄',
    'Besi': '🔩', 'Aluminium': '🥫', 'Kaca/Botol': '🍾', 'Elektronik': '📱',
};

function authFetch(url, options = {}) {
    const token = localStorage.getItem('auth_token');
    return fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    }).then((r) => r.json());
}

export default function Pickup() {
    const navigate = useNavigate();
    const [wasteTypes, setWasteTypes] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [address, setAddress] = useState('');
    const [estimatedWeight, setEstimatedWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [step, setStep] = useState('form'); // form | success
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/waste-types', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((d) => setWasteTypes(d.data || []));

        // Pre-fill address from user profile
        const token = localStorage.getItem('auth_token');
        if (token) {
            authFetch('/api/user/profile').then(d => {
                // Use stored user address if available
            });
        }
    }, []);

    const toggleType = (wt) => {
        setSelectedTypes((prev) =>
            prev.find(t => t.id === wt.id) ? prev.filter(t => t.id !== wt.id) : [...prev, wt]
        );
    };

    const handleSubmit = async () => {
        if (!address || selectedTypes.length === 0) return;
        setLoading(true);
        try {
            const wasteDesc = selectedTypes.map(t => t.name).join(', ');
            await authFetch('/api/user/pickup-request', {
                method: 'POST',
                body: JSON.stringify({
                    address,
                    waste_description: wasteDesc,
                    estimated_weight: estimatedWeight || 'Tidak diketahui',
                    notes,
                }),
            });
            setStep('success');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="mobile-page dropoff-success">
                <div className="success-animation">
                    <div className="success-circle success-circle-orange">
                        <Truck size={48} />
                    </div>
                </div>
                <h2>Kurir Dalam Perjalanan! 🚛</h2>
                <p className="success-points">Estimasi kedatangan: 30 - 60 menit</p>
                <div className="success-message">
                    <p>Kurir kami akan segera menghubungi Anda. Pastikan sampah sudah dipilah ya! 🌿</p>
                </div>
                <button className="login-btn" onClick={() => navigate('/app')}>
                    Kembali ke Beranda
                </button>
                <button className="login-btn login-btn-outline" onClick={() => navigate('/app/history')} style={{ marginTop: 12 }}>
                    Lihat Status Penjemputan
                </button>
            </div>
        );
    }

    return (
        <div className="mobile-page">
            <div className="mobile-page-header">
                <button className="back-btn" onClick={() => navigate('/app')}><ArrowLeft size={22} /></button>
                <h2>Jemput ke Rumah</h2>
            </div>

            {/* Address */}
            <div className="pickup-section">
                <label className="pickup-label"><MapPin size={16} /> Alamat Penjemputan</label>
                <textarea
                    className="pickup-textarea"
                    placeholder="Masukkan alamat lengkap..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                />
            </div>

            {/* Waste Types */}
            <div className="pickup-section">
                <label className="pickup-label">♻️ Pilih Jenis Sampah</label>
                <div className="waste-chips">
                    {wasteTypes.map((wt) => (
                        <button
                            key={wt.id}
                            className={`waste-chip ${selectedTypes.find(t => t.id === wt.id) ? 'selected' : ''}`}
                            onClick={() => toggleType(wt)}
                        >
                            <span>{wasteIcons[wt.name] || '♻️'}</span>
                            <span>{wt.name}</span>
                            {selectedTypes.find(t => t.id === wt.id) && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Weight estimate */}
            <div className="pickup-section">
                <label className="pickup-label">⚖️ Estimasi Berat (opsional)</label>
                <div className="pickup-input-row">
                    <input
                        type="text"
                        className="pickup-input"
                        placeholder="Misal: 5"
                        value={estimatedWeight}
                        onChange={(e) => setEstimatedWeight(e.target.value)}
                    />
                    <span className="pickup-input-unit">Kg</span>
                </div>
            </div>

            {/* Notes */}
            <div className="pickup-section">
                <label className="pickup-label">📝 Catatan (opsional)</label>
                <input
                    type="text"
                    className="pickup-input pickup-input-full"
                    placeholder="Misal: Sampah di depan pagar"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <button
                className="login-btn"
                onClick={handleSubmit}
                disabled={!address || selectedTypes.length === 0 || loading}
            >
                {loading ? 'Mengirim...' : 'Pesan Kurir'} <Truck size={18} />
            </button>
        </div>
    );
}
