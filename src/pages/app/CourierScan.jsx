import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Check, Package, AlertTriangle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

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

export default function CourierScan() {
    const { pickupId } = useParams();
    const navigate = useNavigate();

    const [step, setStep] = useState('scan'); // scan | input | success
    const [scanError, setScanError] = useState('');
    const [pickupData, setPickupData] = useState(null);
    const [scanning, setScanning] = useState(false);

    // Input step
    const [wasteTypes, setWasteTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [weight, setWeight] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Success step
    const [result, setResult] = useState(null);

    const scannerRef = useRef(null);
    const scannerInstanceRef = useRef(null);

    useEffect(() => {
        fetch('/api/waste-types', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((d) => setWasteTypes(d.data || []));
    }, []);

    // Start QR scanner
    useEffect(() => {
        if (step !== 'scan' || !scannerRef.current) return;

        let html5QrCode = null;

        const startScanner = async () => {
            try {
                html5QrCode = new Html5Qrcode('qr-scanner-region');
                scannerInstanceRef.current = html5QrCode;
                setScanning(true);

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1,
                    },
                    async (decodedText) => {
                        // QR scanned — validate
                        setScanning(false);
                        try {
                            await html5QrCode.stop();
                        } catch (e) { /* ignore */ }

                        // Extract token from QR: "lumbunghijau:user:{token}"
                        const parts = decodedText.split(':');
                        if (parts.length !== 3 || parts[0] !== 'lumbunghijau' || parts[1] !== 'user') {
                            setScanError('QR Code tidak valid. Pastikan warga menunjukkan QR dari aplikasi LumbungHijau.');
                            return;
                        }

                        const qrToken = parts[2];

                        // Validate with server
                        const res = await authFetch('/api/courier/validate-qr', {
                            method: 'POST',
                            body: JSON.stringify({ qr_token: qrToken, pickup_id: parseInt(pickupId) }),
                        });

                        if (res.valid) {
                            setPickupData(res.data);
                            setStep('input');
                        } else {
                            setScanError(res.message || 'QR tidak cocok dengan penugasan.');
                        }
                    },
                    () => { /* ignore errors during scan */ }
                );
            } catch (err) {
                console.error('Scanner error:', err);
                setScanError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
                setScanning(false);
            }
        };

        const timeout = setTimeout(startScanner, 300);

        return () => {
            clearTimeout(timeout);
            if (scannerInstanceRef.current) {
                try {
                    scannerInstanceRef.current.stop();
                } catch (e) { /* ignore */ }
            }
        };
    }, [step, pickupId]);

    const handleSubmit = async () => {
        if (!selectedType || !weight || parseFloat(weight) <= 0) return;
        setSubmitting(true);
        try {
            const res = await authFetch('/api/courier/complete-pickup', {
                method: 'POST',
                body: JSON.stringify({
                    pickup_id: parseInt(pickupId),
                    waste_type_id: selectedType.id,
                    weight_kg: parseFloat(weight),
                }),
            });
            if (res.data) {
                setResult(res.data);
                setStep('success');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // ===== SUCCESS SCREEN =====
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
                <h2>Penjemputan Selesai! 🎉</h2>

                <div className="courier-result-card">
                    <div className="courier-result-row">
                        <span>Warga</span>
                        <strong>{result?.warga_name}</strong>
                    </div>
                    <div className="courier-result-row">
                        <span>Jenis Sampah</span>
                        <strong>{result?.waste_type}</strong>
                    </div>
                    <div className="courier-result-row">
                        <span>Berat</span>
                        <strong>{result?.weight_kg} Kg</strong>
                    </div>
                    <div className="courier-result-divider" />
                    <div className="courier-result-row">
                        <span>Total Poin</span>
                        <strong>{result?.total_points}</strong>
                    </div>
                    <div className="courier-result-row courier-result-fee">
                        <span>Biaya Jemput (10%)</span>
                        <strong>-{result?.pickup_fee}</strong>
                    </div>
                    <div className="courier-result-divider" />
                    <div className="courier-result-row courier-result-net">
                        <span>Poin Dikirim ke Warga</span>
                        <strong>+{result?.net_points}</strong>
                    </div>
                </div>

                <p className="success-balance">Saldo baru warga: {result?.warga_new_balance?.toLocaleString()} Eco-Points</p>

                <button className="login-btn" onClick={() => navigate('/app/courier')}>
                    Kembali ke Daftar Tugas
                </button>
            </div>
        );
    }

    // ===== INPUT WEIGHT SCREEN =====
    if (step === 'input') {
        const estimatedPoints = selectedType && weight
            ? Math.round(parseFloat(weight) * (selectedType.price_per_kg / 10))
            : 0;
        const pickupFee = Math.max(50, Math.round(estimatedPoints * 0.10));
        const netPoints = estimatedPoints - pickupFee;

        return (
            <div className="mobile-page">
                <div className="mobile-page-header">
                    <button className="back-btn" onClick={() => { setStep('scan'); setScanError(''); }}>
                        <ArrowLeft size={22} />
                    </button>
                    <h2>Input Berat Sampah</h2>
                </div>

                <div className="courier-validated-card">
                    <Check size={18} className="courier-validated-icon" />
                    <div>
                        <strong>QR Valid</strong>
                        <span>Warga: {pickupData?.warga_name}</span>
                    </div>
                </div>

                {/* Waste type selector */}
                <label className="pickup-label" style={{ marginTop: 16 }}>♻️ Jenis Sampah</label>
                <div className="waste-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {wasteTypes.map((wt) => (
                        <button
                            key={wt.id}
                            className={`waste-type-card ${selectedType?.id === wt.id ? 'selected' : ''}`}
                            onClick={() => setSelectedType(wt)}
                            style={{ padding: '12px 8px' }}
                        >
                            <span className="waste-type-icon" style={{ fontSize: '1.4rem' }}>{wasteIcons[wt.name] || '♻️'}</span>
                            <span className="waste-type-name" style={{ fontSize: '0.7rem' }}>{wt.name}</span>
                        </button>
                    ))}
                </div>

                {/* Weight input */}
                {selectedType && (
                    <div className="weight-card" style={{ marginTop: 8 }}>
                        <div className="weight-selected">
                            <span className="weight-icon">{wasteIcons[selectedType.name] || '♻️'}</span>
                            <span>{selectedType.name} — Rp {selectedType.price_per_kg?.toLocaleString()}/Kg</span>
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
                            <div className="courier-points-breakdown">
                                <div className="courier-result-row">
                                    <span>Total Poin</span>
                                    <strong>{estimatedPoints.toLocaleString()}</strong>
                                </div>
                                <div className="courier-result-row courier-result-fee">
                                    <span>Biaya Jemput (10%)</span>
                                    <strong>-{pickupFee}</strong>
                                </div>
                                <div className="courier-result-row courier-result-net">
                                    <span>Warga Terima</span>
                                    <strong>+{netPoints > 0 ? netPoints : 0}</strong>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button
                    className="login-btn"
                    onClick={handleSubmit}
                    disabled={!selectedType || !weight || parseFloat(weight) <= 0 || submitting}
                >
                    {submitting ? 'Memproses...' : 'Konfirmasi & Kirim Poin'} <Package size={18} />
                </button>
            </div>
        );
    }

    // ===== QR SCAN SCREEN =====
    return (
        <div className="mobile-page">
            <div className="mobile-page-header">
                <button className="back-btn" onClick={() => navigate('/app/courier')}>
                    <ArrowLeft size={22} />
                </button>
                <h2>Scan QR Warga</h2>
            </div>

            <div className="scanner-instructions">
                <Camera size={20} />
                <span>Arahkan kamera ke QR Code di HP warga</span>
            </div>

            {scanError && (
                <div className="scanner-error">
                    <AlertTriangle size={18} />
                    <span>{scanError}</span>
                    <button onClick={() => { setScanError(''); setStep('scan'); }}>Scan Ulang</button>
                </div>
            )}

            <div className="scanner-container">
                <div id="qr-scanner-region" ref={scannerRef} className="scanner-viewport" />
                {scanning && (
                    <div className="scanner-overlay">
                        <div className="scanner-frame">
                            <div className="scanner-corner scanner-corner-tl" />
                            <div className="scanner-corner scanner-corner-tr" />
                            <div className="scanner-corner scanner-corner-bl" />
                            <div className="scanner-corner scanner-corner-br" />
                        </div>
                        <p className="scanner-hint">Memindai...</p>
                    </div>
                )}
            </div>

            <div className="scanner-manual-hint">
                <p>💡 QR Code ada di menu <strong>Profil</strong> warga</p>
            </div>
        </div>
    );
}
