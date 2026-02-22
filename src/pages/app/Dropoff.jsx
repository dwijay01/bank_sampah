import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Package } from 'lucide-react';

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

export default function Dropoff() {
    const navigate = useNavigate();
    const [wasteTypes, setWasteTypes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [weight, setWeight] = useState('');
    const [step, setStep] = useState('select'); // select | weight | success
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/waste-types', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((d) => setWasteTypes(d.data || []));
    }, []);

    const estimatedPoints = selected && weight
        ? Math.round(parseFloat(weight) * (selected.price_per_kg / 10))
        : 0;

    const handleSubmit = async () => {
        if (!selected || !weight) return;
        setLoading(true);
        try {
            const data = await authFetch('/api/user/dropoff', {
                method: 'POST',
                body: JSON.stringify({ waste_type_id: selected.id, weight_kg: parseFloat(weight) }),
            });
            setResult(data);
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
                    <div className="success-circle">
                        <Check size={48} />
                    </div>
                    <div className="confetti-container">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className={`confetti confetti-${i % 4}`} style={{ left: `${8 + i * 7.5}%`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                </div>
                <h2>Setor Berhasil! 🎉</h2>
                <p className="success-points">+{result?.points_earned || 0} Eco-Points</p>
                <p className="success-balance">Saldo baru: {(result?.new_balance || 0).toLocaleString()} poin</p>
                <div className="success-message">
                    <p>Hebat! Setoranmu setara dengan menghemat <strong>{Math.round(parseFloat(weight) * 2)} liter air bumi</strong> 🌍</p>
                </div>
                <button className="login-btn" onClick={() => navigate('/app')}>
                    Kembali ke Beranda
                </button>
            </div>
        );
    }

    if (step === 'weight') {
        return (
            <div className="mobile-page">
                <div className="mobile-page-header">
                    <button className="back-btn" onClick={() => setStep('select')}><ArrowLeft size={22} /></button>
                    <h2>Masukkan Berat</h2>
                </div>

                <div className="weight-card">
                    <div className="weight-selected">
                        <span className="weight-icon">{wasteIcons[selected.name] || '♻️'}</span>
                        <span>{selected.name}</span>
                    </div>

                    <div className="weight-input-group">
                        <input
                            type="number"
                            className="weight-input"
                            placeholder="0.0"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            step="0.1"
                            min="0.1"
                            autoFocus
                        />
                        <span className="weight-unit">Kg</span>
                    </div>

                    {weight > 0 && (
                        <div className="weight-estimate">
                            <p>✨ Estimasi: <strong>{estimatedPoints.toLocaleString()} Eco-Points</strong></p>
                            <p className="weight-price">Harga: Rp {selected.price_per_kg?.toLocaleString()}/Kg</p>
                        </div>
                    )}
                </div>

                <button
                    className="login-btn"
                    onClick={handleSubmit}
                    disabled={!weight || parseFloat(weight) <= 0 || loading}
                >
                    {loading ? 'Memproses...' : 'Konfirmasi Setoran'} <Package size={18} />
                </button>
            </div>
        );
    }

    // Step: select waste type
    return (
        <div className="mobile-page">
            <div className="mobile-page-header">
                <button className="back-btn" onClick={() => navigate('/app')}><ArrowLeft size={22} /></button>
                <h2>Antar ke Posko</h2>
            </div>
            <p className="mobile-subtitle">Pilih jenis sampah yang Anda setorkan:</p>

            <div className="waste-grid">
                {wasteTypes.map((wt) => (
                    <button
                        key={wt.id}
                        className={`waste-type-card ${selected?.id === wt.id ? 'selected' : ''}`}
                        onClick={() => setSelected(wt)}
                    >
                        <span className="waste-type-icon">{wasteIcons[wt.name] || '♻️'}</span>
                        <span className="waste-type-name">{wt.name}</span>
                        <span className="waste-type-price">Rp {wt.price_per_kg?.toLocaleString()}/Kg</span>
                    </button>
                ))}
            </div>

            {selected && (
                <button className="login-btn" onClick={() => setStep('weight')}>
                    Lanjut — {selected.name} <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                </button>
            )}
        </div>
    );
}
