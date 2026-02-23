import { useState, useEffect } from 'react';
import { Trophy, Star, Award } from 'lucide-react';
import api from '../../services/api';
import confetti from 'canvas-confetti';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(0);
    const [myPoints, setMyPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/user/leaderboard');
            setLeaderboard(res.data.data);
            setMyRank(res.data.my_rank);
            setMyPoints(res.data.my_points);

            // trigger confetti if rank 1-3
            if (res.data.my_rank <= 3 && res.data.my_points > 0) {
                triggerConfetti();
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#4ade80', '#22c55e', '#16a34a', '#fbbf24']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#4ade80', '#22c55e', '#16a34a', '#fbbf24']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Award size={28} className="text-yellow-400 drop-shadow-md" />;
            case 1: return <Award size={26} className="text-gray-400 drop-shadow-md" />;
            case 2: return <Award size={24} className="text-amber-700 drop-shadow-md" />;
            default: return <span className="text-gray-500 font-bold w-6 text-center">{index + 1}</span>;
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
        <div className="pb-24 max-w-md mx-auto relative bg-gray-50 min-h-screen">
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-b-[40px] px-6 pt-12 pb-20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy size={28} className="text-yellow-300" />
                        Peringkat Warga
                    </h1>
                </div>

                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-5 flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-green-100 text-sm font-medium mb-1">Peringkat Anda</p>
                        <div className="text-3xl font-extrabold text-white flex items-baseline gap-1">
                            #{myRank} <span className="text-sm font-normal text-green-200">/ Total</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-green-100 text-sm font-medium mb-1">Poin Terkumpul</p>
                        <div className="text-2xl font-bold text-yellow-300 flex items-center gap-1 justify-end">
                            {myPoints} <Star size={18} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden">
                    {leaderboard.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Belum ada data peringkat.</div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {leaderboard.map((user, index) => (
                                <div
                                    key={user.id}
                                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${index < 3 ? 'bg-green-50/50 border border-green-100' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center justify-center w-8">
                                        {getRankIcon(index)}
                                    </div>

                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-2xl shadow-inner border border-green-300/50">
                                        {user.level_icon || '🌱'}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{user.name}</h3>
                                        <p className="text-xs text-green-600 font-medium">{user.level_name}</p>
                                    </div>

                                    <div className="flex items-center gap-1 bg-green-100/50 px-3 py-1.5 rounded-lg border border-green-200">
                                        <span className="font-bold text-green-700">{user.eco_points}</span>
                                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
