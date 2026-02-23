import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import authFetch from '../../utils/authFetch';
import dayjs from 'dayjs';

export default function MyVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const res = await authFetch('/api/user/vouchers');
            setVouchers(res.data);
        } catch (error) {
            console.error('Failed to fetch vouchers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mobile-loading">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Memuat Dompet...</span>
            </div>
        );
    }

    return (
        <div className="mobile-page" style={{ paddingBottom: '96px', background: vouchers.length === 0 ? '#FFFFFF' : 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ background: 'var(--emerald)', color: 'white', padding: '24px 24px 32px', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px', boxShadow: 'var(--shadow-md)', margin: '-20px -20px 24px -20px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Ticket size={28} />
                    Dompet Voucher
                </h1>
                <p style={{ color: 'var(--emerald-light)', marginTop: '8px', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    Tunjukkan QR Code voucher aktif Anda ke Kasir Warung Mitra saat penukaran.
                </p>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {vouchers.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px 16px 64px' }}>
                        <div className="gamified-svg-container" style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '24px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))', animation: 'bounce 3s infinite ease-in-out' }}>
                            {/* SVG Illustration - Open Gift Box */}
                            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                                <rect x="30" y="80" width="140" height="100" rx="16" fill="#10B981" />
                                <rect x="20" y="60" width="160" height="30" rx="8" fill="#059669" />
                                <path d="M100 80V180" stroke="#047857" strokeWidth="12" />
                                <path d="M30 130H170" stroke="#047857" strokeWidth="12" />
                                {/* Ribbon bows */}
                                <path d="M100 60C100 60 70 20 40 40C10 60 80 60 100 60Z" fill="#FBBF24" />
                                <path d="M100 60C100 60 130 20 160 40C190 60 120 60 100 60Z" fill="#FBBF24" />
                                {/* Stars popping out */}
                                <path d="M60 20L65 30L75 35L65 40L60 50L55 40L45 35L55 30L60 20Z" fill="#FCD34D" style={{ animation: 'pulse 2s infinite' }} />
                                <path d="M140 10L143 18L151 21L143 24L140 32L137 24L129 21L137 18L140 10Z" fill="#FCD34D" style={{ animation: 'pulse 2s infinite 0.5s' }} />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.02em' }}>Kriuk.. Kosong!</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.6, marginBottom: '40px', fontSize: '1rem' }}>
                            Dompet Anda bersedih karena kelaparan. Ayo tukarkan Eco-Points dengan hadiah menarik!
                        </p>

                        <button
                            onClick={() => navigate('/app/rewards')}
                            className="gamified-btn"
                            style={{ width: '100%', maxWidth: '320px', background: 'var(--orange)', color: 'white', fontWeight: 900, padding: '16px 24px', borderRadius: '16px', border: 'none', boxShadow: '0 8px 0 0 var(--orange-dark), 0 15px 20px rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        >
                            Pergi ke Toko Poin 🛒
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {vouchers.map((voucher) => (
                            <div
                                key={voucher.id}
                                className="floating-card"
                                style={{ padding: '16px', display: 'flex', gap: '16px', position: 'relative', overflow: 'hidden', cursor: voucher.status === 'Aktif' ? 'pointer' : 'default', opacity: voucher.status === 'Aktif' ? 1 : 0.7, filter: voucher.status === 'Aktif' ? 'none' : 'grayscale(50%)' }}
                                onClick={() => voucher.status === 'Aktif' && setSelectedVoucher(voucher)}
                            >
                                {/* Ribbon for active voucher */}
                                {voucher.status === 'Aktif' && (
                                    <div style={{ position: 'absolute', right: '-32px', top: '16px', background: 'var(--emerald)', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 32px', transform: 'rotate(45deg)', boxShadow: 'var(--shadow-sm)' }}>
                                        SIAP PAKAI
                                    </div>
                                )}

                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg)', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {voucher.reward.image_url ? (
                                        <img src={voucher.reward.image_url} alt={voucher.reward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Ticket size={24} style={{ color: 'var(--text-muted)' }} />
                                    )}
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: voucher.status === 'Aktif' ? '24px' : '0' }}>
                                    <h3 style={{ fontWeight: 'bold', color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.3, marginBottom: '8px' }}>{voucher.reward.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Clock size={12} />
                                        <span>Ditukar: {dayjs(voucher.created_at).format('DD MMM YYYY, HH:mm')}</span>
                                    </div>
                                    {voucher.status === 'Digunakan' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#2563EB', fontWeight: 500, marginTop: '4px' }}>
                                            <CheckCircle size={12} />
                                            <span>Dipakai: {dayjs(voucher.used_at).format('DD MMM YYYY, HH:mm')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QR Code Modal for Active Voucher */}
            {selectedVoucher && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedVoucher(null)}>
                    <div
                        style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '360px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            style={{ position: 'absolute', top: '16px', right: '20px', color: 'var(--text-muted)', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
                            onClick={() => setSelectedVoucher(null)}
                        >
                            ✕
                        </button>

                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--emerald-50)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <Ticket size={32} />
                        </div>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)', textAlign: 'center', marginBottom: '4px' }}>{selectedVoucher.reward.name}</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>Tunjukkan QR ini ke kasir Warung Mitra</p>

                        <div style={{ background: 'white', padding: '16px', borderRadius: '24px', border: '2px solid var(--border)', boxShadow: 'inset var(--shadow-sm)', marginBottom: '24px' }}>
                            <QRCodeSVG
                                value={`lumbunghijau:voucher:${selectedVoucher.qr_code_token}`}
                                size={220}
                                bgColor="#FFFFFF"
                                fgColor="#065F46"
                                level="Q"
                            />
                        </div>

                        <div style={{ background: 'var(--bg)', color: 'var(--emerald-dark)', border: '1px solid var(--emerald-light)', borderRadius: '12px', padding: '12px', width: '100%', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <Info size={18} style={{ color: 'var(--emerald)', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '0.75rem', lineHeight: 1.5, margin: 0 }}>
                                Voucher hanya berlaku untuk satu kali penukaran. Jangan berikan QR ini kepada siapapun selain kasir resmi.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
