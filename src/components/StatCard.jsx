import { motion } from 'framer-motion';
import { TrendingUp, Coins, Truck, TreePine } from 'lucide-react';

const iconMap = {
    TrendingUp,
    Coins,
    Truck,
    TreePine,
};

export default function StatCard({ label, value, trend, trendDir, icon, color }) {
    const IconComponent = iconMap[icon] || TrendingUp;

    return (
        <motion.div
            className="floating-card stat-card"
            whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="stat-card-header">
                <div className={`stat-card-icon ${color}`}>
                    <IconComponent size={22} />
                </div>
                <span className={`stat-card-trend ${trendDir}`}>{trend}</span>
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
        </motion.div>
    );
}
