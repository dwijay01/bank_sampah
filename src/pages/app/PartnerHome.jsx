import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ScanLine, LogOut, Ticket, TrendingUp, CheckCircle } from 'lucide-react';
import authFetch from '../../utils/authFetch';

export default function PartnerHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        vouchers_claimed_today: 0,
        vouchers_claimed_month: 0,
        total_revenue_from_vouchers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await authFetch('/api/partner/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Gagal mengambil statistik warung", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = async () => {
        try {
            await authFetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            // ignore error
        }
        localStorage.removeItem('auth_token');
        navigate('/app/login');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 bg-gray-50 min-h-screen">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="mobile-page pb-24 bg-gray-50 min-h-screen relative">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-700 to-green-900 text-white rounded-b-[40px] px-6 pt-12 pb-24 shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 top-4 text-emerald-600/30">
                    <Store size={140} />
                </div>

                <h1 className="text-3xl font-bold flex items-center gap-3 relative z-10">
                    Mitra Warung
                </h1>
                <p className="text-emerald-100 mt-2 font-medium relative z-10">Panel Layanan Penukaran LumbungHijau</p>
            </div>

            {/* Dashboard Content */}
            <div className="px-5 -mt-14 relative z-20">
                {/* Main Action Button */}
                <button
                    onClick={() => navigate('/app/partner/scan')}
                    className="w-full bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-2xl transition-all hover:-translate-y-1 mb-6 group"
                >
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <ScanLine size={40} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800">Scan Voucher Warga</h2>
                        <p className="text-sm text-gray-500 mt-1">Gunakan kamera untuk memvalidasi QR Code</p>
                    </div>
                </button>

                {/* Stats Grid */}
                <h3 className="font-bold text-gray-800 mb-3 px-2 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-600" />
                    Statistik Pelayanan Anda
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                            <Ticket size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">HARI INI</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-800">{stats.vouchers_claimed_today}</span>
                        <span className="text-xs text-gray-500 mt-1">Voucher Ditukar</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                            <CheckCircle size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">BULAN INI</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-800">{stats.vouchers_claimed_month}</span>
                        <span className="text-xs text-gray-500 mt-1">Total Voucher</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col col-span-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">ESTIMASI PENGGANTIAN DARI LUMBUNGHIJAU</span>
                        <span className="text-2xl font-extrabold text-emerald-700">Rp {stats.total_revenue_from_vouchers.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-white text-red-500 font-bold py-4 rounded-2xl shadow-sm border border-red-100 flex items-center justify-center gap-2"
                >
                    <LogOut size={20} /> Keluar Aplikasi
                </button>
            </div>
        </div>
    );
}
