import { useState, useEffect } from 'react';
import { Gift, ShieldCheck, Ticket } from 'lucide-react';
import authFetch from '../../utils/authFetch';

export default function Rewards() {
    const [rewards, setRewards] = useState([]);
    const [myPoints, setMyPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, rewardsRes] = await Promise.all([
                authFetch('/api/user/profile'),
                authFetch('/api/user/rewards')
            ]);

            setMyPoints(profileRes.data.eco_points);
            setRewards(rewardsRes.data);
        } catch (error) {
            console.error('Failed to fetch store data');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward) => {
        if (myPoints < reward.points_cost) {
            alert('Poin Anda belum mencukupi untuk menukar hadiah ini.');
            return;
        }

        const confirmRedeem = window.confirm(`Apakah Anda yakin ingin menukar ${reward.points_cost} poin dengan ${reward.name}?`);
        if (!confirmRedeem) return;

        try {
            const res = await authFetch('/api/user/rewards/redeem', {
                method: 'POST',
                body: JSON.stringify({ reward_id: reward.id })
            });

            alert(res.message);
            setMyPoints(res.new_balance);
            fetchData(); // Refresh stock
        } catch (error) {
            alert(error.message || 'Gagal menukar hadiah');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    return (
        <div className="mobile-page" style={{ paddingBottom: '96px', background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header & Hero Balance Card */}
            <div style={{ background: 'linear-gradient(135deg, var(--emerald), var(--emerald-dark))', color: 'white', padding: '24px 24px 40px', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px', boxShadow: 'var(--shadow-md)', margin: '-20px -20px 24px -20px', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'scale(2)' }}>
                    <Gift size={120} />
                </div>

                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0', position: 'relative', zIndex: 10 }}>
                    Toko Poin
                </h1>

                {/* Hero Balance Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
                    <p style={{ color: 'var(--emerald-light)', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Saldo Poin Anda
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{myPoints}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--emerald-light)' }}>Pt</span>
                    </div>
                </div>
            </div>

            {/* Catalog Grid */}
            <div style={{ padding: '0 4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {rewards.map((reward) => {
                        const isEnoughPoints = myPoints >= reward.points_cost;
                        const isOutOfStock = reward.stock <= 0;

                        return (
                            <div key={reward.id} className="floating-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                {/* Product Image Container */}
                                <div style={{ height: '110px', background: 'var(--emerald-50)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {reward.image_url ? (
                                        <img src={reward.image_url} alt={reward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Gift size={40} style={{ color: 'var(--emerald-light)' }} />
                                    )}
                                    {isOutOfStock && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                                            <span style={{ background: '#DC2626', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>HABIS</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.95rem', marginBottom: '4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {reward.name}
                                    </h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                                        {reward.description}
                                    </p>

                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ background: 'var(--emerald-light)', color: 'var(--emerald-dark)', padding: '4px 8px', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', display: 'inline-block' }}>
                                                {reward.points_cost} Pt
                                            </div>
                                        </div>

                                        {/* Smart CTA Button */}
                                        <button
                                            onClick={() => handleRedeem(reward)}
                                            disabled={isOutOfStock || !isEnoughPoints}
                                            style={{
                                                width: '100%',
                                                padding: '10px 0',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                fontSize: '0.85rem',
                                                border: 'none',
                                                cursor: isOutOfStock || !isEnoughPoints ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.15s ease',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                background: isOutOfStock
                                                    ? '#F1F5F9'
                                                    : !isEnoughPoints
                                                        ? '#E2E8F0'
                                                        : 'var(--orange)',
                                                color: isOutOfStock || !isEnoughPoints ? '#94A3B8' : 'white',
                                                boxShadow: (!isOutOfStock && isEnoughPoints) ? '0 4px 0 0 var(--orange-dark), 0 8px 16px rgba(249,115,22,0.25)' : 'none',
                                                transform: (!isOutOfStock && isEnoughPoints) ? 'translateY(-2px)' : 'none'
                                            }}
                                            onMouseDown={(e) => {
                                                if (!isOutOfStock && isEnoughPoints) {
                                                    e.currentTarget.style.transform = 'translateY(2px)';
                                                    e.currentTarget.style.boxShadow = '0 0px 0 0 var(--orange-dark), 0 0px 0px rgba(249,115,22,0.25)';
                                                }
                                            }}
                                            onMouseUp={(e) => {
                                                if (!isOutOfStock && isEnoughPoints) {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 0 0 var(--orange-dark), 0 8px 16px rgba(249,115,22,0.25)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isOutOfStock && isEnoughPoints) {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 0 0 var(--orange-dark), 0 8px 16px rgba(249,115,22,0.25)';
                                                }
                                            }}
                                        >
                                            {isOutOfStock ? 'STOK KOSONG' : !isEnoughPoints ? 'POIN KURANG' : 'TUKARKAN'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
