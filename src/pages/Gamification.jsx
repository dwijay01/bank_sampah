import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trophy, Medal, Award } from 'lucide-react';
import { getUserLevels, updateUserLevel, getLeaderboard } from '../services/api';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const rankIcons = {
    1: <Trophy size={20} color="#F59E0B" />,
    2: <Medal size={20} color="#94A3B8" />,
    3: <Award size={20} color="#D97706" />,
};

export default function Gamification() {
    const [levels, setLevels] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [editingLevel, setEditingLevel] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [levelsRes, lbRes] = await Promise.all([
                    getUserLevels(),
                    getLeaderboard(),
                ]);
                setLevels(levelsRes.data);
                setLeaderboard(lbRes.data);
            } catch (err) {
                console.error('Gamification fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const maxKg = leaderboard.length > 0 ? Math.max(...leaderboard.map((l) => l.total_kg)) : 1;

    const handleEditStart = (level) => {
        setEditingLevel(level.id);
        setEditValues({ min_points: level.min_points, max_points: level.max_points });
    };

    const handleSave = async (id) => {
        try {
            const res = await updateUserLevel(id, editValues);
            setLevels((prev) =>
                prev.map((l) => (l.id === id ? res.data : l))
            );
        } catch (err) {
            console.error('Update level error:', err);
        }
        setEditingLevel(null);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <span style={{ color: 'var(--text-muted)' }}>Memuat data...</span>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="page-header">
                <h1>Gamifikasi</h1>
                <p>Kelola level pengguna dan leaderboard RT/RW</p>
            </div>

            {/* Level Management */}
            <div className="floating-card data-table-card" style={{ marginBottom: 24 }}>
                <div className="data-table-header">
                    <h3>Level Management</h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {levels.length} tingkatan
                    </span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Level</th>
                            <th>Nama</th>
                            <th>Batas Min. Poin</th>
                            <th>Batas Maks. Poin</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.map((level) => (
                            <tr key={level.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                background: `${level.color}20`,
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            {level.icon}
                                        </span>
                                        <span style={{ fontWeight: 700, color: level.color }}>{level.id}</span>
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>{level.name}</td>
                                <td>
                                    {editingLevel === level.id ? (
                                        <input
                                            className="inline-edit-input"
                                            type="number"
                                            value={editValues.min_points}
                                            onChange={(e) => setEditValues({ ...editValues, min_points: e.target.value })}
                                        />
                                    ) : (
                                        <span>{level.min_points?.toLocaleString()}</span>
                                    )}
                                </td>
                                <td>
                                    {editingLevel === level.id ? (
                                        <input
                                            className="inline-edit-input"
                                            type="number"
                                            value={editValues.max_points}
                                            onChange={(e) => setEditValues({ ...editValues, max_points: e.target.value })}
                                        />
                                    ) : (
                                        <span>{level.max_points?.toLocaleString()}</span>
                                    )}
                                </td>
                                <td>
                                    {editingLevel === level.id ? (
                                        <button className="btn btn-emerald btn-sm" onClick={() => handleSave(level.id)}>
                                            <Save size={14} /> Simpan
                                        </button>
                                    ) : (
                                        <button className="btn btn-outline btn-sm" onClick={() => handleEditStart(level)}>
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Leaderboard RT/RW */}
            <div className="floating-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Leaderboard RT/RW</h3>
                    <button className="btn btn-emerald btn-sm">
                        <Plus size={14} /> Daftar RT/RW Baru
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {leaderboard.map((item) => (
                        <motion.div
                            key={item.id}
                            className="floating-card"
                            style={{
                                padding: 20,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 20,
                                border: item.rank === 1 ? '2px solid var(--orange)' : '1px solid rgba(0,0,0,0.04)',
                                background: item.rank === 1 ? 'var(--orange-light)' : 'var(--white)',
                            }}
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {/* Rank */}
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: item.rank <= 3 ? 'var(--emerald-light)' : 'var(--bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '1.1rem',
                                    color: 'var(--emerald-dark)',
                                    flexShrink: 0,
                                }}
                            >
                                {rankIcons[item.rank] || `#${item.rank}`}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--emerald-dark)', fontSize: '0.95rem' }}>
                                        {item.total_kg} Kg
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${(item.total_kg / maxKg) * 100}%` }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        {item.total_points?.toLocaleString()} Eco-Points
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        {item.members_count} anggota
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
