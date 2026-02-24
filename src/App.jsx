import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Operations from './pages/Operations';
import Wallet from './pages/Wallet';
import Gamification from './pages/Gamification';

import MobileLayout from './components/mobile/MobileLayout';
import Login from './pages/app/Login';
import Home from './pages/app/Home';
import Dropoff from './pages/app/Dropoff';
import Pickup from './pages/app/Pickup';
import History from './pages/app/History';
import Leaderboard from './pages/app/Leaderboard';
import Profile from './pages/app/Profile';
import Rewards from './pages/app/Rewards';
import MyVouchers from './pages/app/MyVouchers';

import CourierHome from './pages/app/CourierHome';
import CourierScan from './pages/app/CourierScan';

import PartnerHome from './pages/app/PartnerHome';
import PartnerScan from './pages/app/PartnerScan';

// Admin Toko Poin
import RewardManagement from './pages/RewardManagement';
import RedemptionCenter from './pages/RedemptionCenter';
import PartnerHub from './pages/PartnerHub';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root → redirect to user app */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* ===== ADMIN DASHBOARD ===== */}
        <Route element={<Layout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/operations" element={<Operations />} />
          <Route path="/admin/wallet" element={<Wallet />} />
          <Route path="/admin/gamification" element={<Gamification />} />

          <Route path="/admin/rewards" element={<RewardManagement />} />
          <Route path="/admin/redemptions" element={<RedemptionCenter />} />
          <Route path="/admin/partners" element={<PartnerHub />} />
        </Route>
        <Route path="/app/login" element={<Login />} />
        <Route element={<MobileLayout />}>
          {/* Warga routes */}
          <Route path="/app" element={<Home />} />
          <Route path="/app/dropoff" element={<Dropoff />} />
          <Route path="/app/pickup" element={<Pickup />} />
          <Route path="/app/history" element={<History />} />
          <Route path="/app/leaderboard" element={<Leaderboard />} />
          <Route path="/app/rewards" element={<Rewards />} />
          <Route path="/app/vouchers" element={<MyVouchers />} />
          <Route path="/app/profile" element={<Profile />} />

          {/* Courier routes */}
          <Route path="/app/courier" element={<CourierHome />} />
          <Route path="/app/courier/scan/:pickupId" element={<CourierScan />} />

          {/* Mitra routes */}
          <Route path="/app/partner" element={<PartnerHome />} />
          <Route path="/app/partner/scan" element={<PartnerScan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
