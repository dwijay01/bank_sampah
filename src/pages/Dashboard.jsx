import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import { getDashboardStats, getDepositTrend, getWasteDistribution, getTransactions, processTransaction } from '../services/api';

const statusBadge = (status) => {
    const map = {
        'Selesai': 'badge-success',
        'Menunggu': 'badge-warning',
        'Dijemput': 'badge-info',
    };
    return map[status] || 'badge-info';
};

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
    const [stats, setStats] = useState([]);
    const [trend, setTrend] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, trendRes, distRes, trxRes] = await Promise.all([
                    getDashboardStats(),
                    getDepositTrend(),
                    getWasteDistribution(),
                    getTransactions(),
                ]);
                setStats(statsRes.data);
                setTrend(trendRes.data);
                setDistribution(distRes.data);
                setTransactions(trxRes.data || []);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleProcess = async (id) => {
        try {
            await processTransaction(id);
            setTransactions((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status: 'Selesai' } : t))
            );
            // refresh stats
            const statsRes = await getDashboardStats();
            setStats(statsRes.data);
        } catch (err) {
            console.error('Process error:', err);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="loading-spinner" />
                <span style={{ marginLeft: 12, color: 'var(--text-muted)' }}>Memuat data...</span>
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Page Header */}
            <motion.div className="page-header" variants={fadeUp}>
                <h1>Pusat Kendali Analitik</h1>
                <p>Ringkasan aktivitas Bank Sampah hari ini</p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div className="stat-cards" variants={fadeUp}>
                {stats.map((stat) => (
                    <StatCard key={stat.id} {...stat} />
                ))}
            </motion.div>

            {/* Charts Row */}
            <motion.div className="charts-row" variants={fadeUp}>
                {/* Area Chart - Deposit Trend */}
                <div className="floating-card chart-card">
                    <div className="chart-card-header">
                        <h3>Tren Setoran 7 Hari</h3>
                        <span>Kilogram</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={trend}>
                            <defs>
                                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                    fontSize: 13,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="kg"
                                stroke="#059669"
                                strokeWidth={3}
                                fill="url(#emeraldGradient)"
                                dot={{ r: 4, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Donut Chart - Waste Distribution */}
                <div className="floating-card chart-card">
                    <div className="chart-card-header">
                        <h3>Distribusi Jenis Sampah</h3>
                        <span>Persentase</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={4}
                                dataKey="value"
                                label={({ name, value }) => `${name} ${value}%`}
                                labelLine={false}
                            >
                                {distribution.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                    fontSize: 13,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Activity Table */}
            <motion.div className="floating-card data-table-card" variants={fadeUp}>
                <div className="data-table-header">
                    <h3>Aktivitas Terakhir</h3>
                    <button className="btn btn-outline btn-sm">Lihat Semua</button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama Warga</th>
                            <th>Jenis Layanan</th>
                            <th>Berat Sampah</th>
                            <th>Poin</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.slice(0, 5).map((trx) => (
                            <tr key={trx.id}>
                                <td style={{ fontWeight: 600, color: '#64748B', fontSize: '0.8rem' }}>TRX-{String(trx.id).padStart(3, '0')}</td>
                                <td style={{ fontWeight: 600 }}>{trx.user?.name || '-'}</td>
                                <td>{trx.service_type}</td>
                                <td>{trx.weight_kg} Kg</td>
                                <td style={{ fontWeight: 600, color: '#059669' }}>{trx.points_earned?.toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${statusBadge(trx.status)}`}>{trx.status}</span>
                                </td>
                                <td>
                                    {trx.status === 'Menunggu' ? (
                                        <button className="btn btn-orange btn-sm" onClick={() => handleProcess(trx.id)}>Proses</button>
                                    ) : (
                                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
