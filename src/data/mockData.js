// ===== DASHBOARD STATS =====
export const dashboardStats = [
  {
    id: 1,
    label: 'Total Sampah Hari Ini',
    value: '150 Kg',
    trend: '+12%',
    trendDir: 'up',
    icon: 'TrendingUp',
    color: 'emerald',
  },
  {
    id: 2,
    label: 'Eco-Points Disalurkan',
    value: '45.000',
    trend: '+8%',
    trendDir: 'up',
    icon: 'Coins',
    color: 'orange',
  },
  {
    id: 3,
    label: 'Permintaan Jemput Tertunda',
    value: '8',
    trend: '-3',
    trendDir: 'down',
    icon: 'Truck',
    color: 'orange',
  },
  {
    id: 4,
    label: 'Dampak Ekologis',
    value: '12 Pohon',
    trend: '+2',
    trendDir: 'up',
    icon: 'TreePine',
    color: 'emerald',
  },
];

// ===== DEPOSIT TREND (7 DAYS) =====
export const depositTrendData = [
  { day: 'Sen', kg: 120 },
  { day: 'Sel', kg: 98 },
  { day: 'Rab', kg: 145 },
  { day: 'Kam', kg: 130 },
  { day: 'Jum', kg: 160 },
  { day: 'Sab', kg: 175 },
  { day: 'Min', kg: 150 },
];

// ===== WASTE DISTRIBUTION =====
export const wasteDistribution = [
  { name: 'Plastik', value: 40, fill: '#059669' },
  { name: 'Kardus', value: 35, fill: '#F97316' },
  { name: 'Besi', value: 25, fill: '#2563EB' },
];

// ===== RECENT TRANSACTIONS =====
export const recentTransactions = [
  {
    id: 'TRX-001',
    name: 'Ahmad Rusdi',
    service: 'Drop-off',
    weight: '5.2 Kg',
    points: 520,
    status: 'Selesai',
  },
  {
    id: 'TRX-002',
    name: 'Siti Aminah',
    service: 'Jemput',
    weight: '3.8 Kg',
    points: 380,
    status: 'Menunggu',
  },
  {
    id: 'TRX-003',
    name: 'Budi Santoso',
    service: 'Drop-off',
    weight: '12.0 Kg',
    points: 1200,
    status: 'Selesai',
  },
  {
    id: 'TRX-004',
    name: 'Dewi Lestari',
    service: 'Jemput',
    weight: '7.5 Kg',
    points: 750,
    status: 'Dijemput',
  },
  {
    id: 'TRX-005',
    name: 'Rudi Hermawan',
    service: 'Drop-off',
    weight: '2.1 Kg',
    points: 210,
    status: 'Menunggu',
  },
];

// ===== COURIER REQUESTS =====
export const courierRequests = [
  {
    id: 'PU-001',
    requester: 'Siti Aminah',
    address: 'Jl. Melati No. 12, RT 03/RW 05',
    wasteType: 'Plastik, Kardus',
    estimatedWeight: '5 Kg',
    courier: '',
    status: 'Menunggu',
  },
  {
    id: 'PU-002',
    requester: 'Rudi Hermawan',
    address: 'Jl. Anggrek No. 8, RT 01/RW 02',
    wasteType: 'Besi, Plastik',
    estimatedWeight: '8 Kg',
    courier: '',
    status: 'Menunggu',
  },
  {
    id: 'PU-003',
    requester: 'Rina Wati',
    address: 'Jl. Dahlia No. 22, RT 07/RW 03',
    wasteType: 'Kardus',
    estimatedWeight: '3 Kg',
    courier: 'Pak Joko',
    status: 'Ditugaskan',
  },
  {
    id: 'PU-004',
    requester: 'Agus Prasetyo',
    address: 'Jl. Mawar No. 5, RT 02/RW 01',
    wasteType: 'Plastik',
    estimatedWeight: '4 Kg',
    courier: 'Pak Dedi',
    status: 'Dijemput',
  },
];

export const courierList = ['Pak Joko', 'Pak Dedi', 'Pak Surya', 'Pak Hendra'];

// ===== WASTE PRICES =====
export const wastePrices = [
  { id: 1, type: 'Plastik PET', price: 3500, unit: 'Kg' },
  { id: 2, type: 'Plastik HDPE', price: 4000, unit: 'Kg' },
  { id: 3, type: 'Kardus', price: 2000, unit: 'Kg' },
  { id: 4, type: 'Kertas HVS', price: 2500, unit: 'Kg' },
  { id: 5, type: 'Besi', price: 5000, unit: 'Kg' },
  { id: 6, type: 'Aluminium', price: 12000, unit: 'Kg' },
  { id: 7, type: 'Kaca/Botol', price: 1500, unit: 'Kg' },
  { id: 8, type: 'Elektronik', price: 8000, unit: 'Kg' },
];

// ===== WITHDRAWAL REQUESTS =====
export const withdrawalRequests = [
  {
    id: 'WD-001',
    name: 'Ahmad Rusdi',
    points: 5000,
    amount: 'Rp 50.000',
    method: 'Transfer Bank',
    date: '2026-02-20',
    status: 'Menunggu',
  },
  {
    id: 'WD-002',
    name: 'Siti Aminah',
    points: 3000,
    amount: 'Rp 30.000',
    method: 'E-Wallet',
    date: '2026-02-19',
    status: 'Menunggu',
  },
  {
    id: 'WD-003',
    name: 'Budi Santoso',
    points: 10000,
    amount: 'Rp 100.000',
    method: 'Transfer Bank',
    date: '2026-02-18',
    status: 'Disetujui',
  },
  {
    id: 'WD-004',
    name: 'Dewi Lestari',
    points: 2000,
    amount: 'Rp 20.000',
    method: 'Voucher Warung',
    date: '2026-02-18',
    status: 'Ditolak',
  },
];

// ===== WARUNG PARTNERS =====
export const warungPartners = [
  {
    id: 'WR-001',
    name: 'Warung Bu Tini',
    address: 'Jl. Kenanga No. 3',
    vouchersRedeemed: 45,
    joinDate: '2025-08-15',
    status: 'Aktif',
  },
  {
    id: 'WR-002',
    name: 'Toko Pak Rahmat',
    address: 'Jl. Flamboyan No. 10',
    vouchersRedeemed: 32,
    joinDate: '2025-09-20',
    status: 'Aktif',
  },
  {
    id: 'WR-003',
    name: 'Warung Sejahtera',
    address: 'Jl. Cemara No. 7',
    vouchersRedeemed: 18,
    joinDate: '2025-11-01',
    status: 'Nonaktif',
  },
];

// ===== USER LEVELS =====
export const userLevels = [
  { id: 1, name: 'Pemula Hijau', minPoints: 0, maxPoints: 500, icon: '🌱', color: '#86EFAC' },
  { id: 2, name: 'Pejuang Lingkungan', minPoints: 501, maxPoints: 2000, icon: '♻️', color: '#34D399' },
  { id: 3, name: 'Duta Bumi', minPoints: 2001, maxPoints: 5000, icon: '🌍', color: '#10B981' },
  { id: 4, name: 'Pahlawan Bumi', minPoints: 5001, maxPoints: 99999, icon: '🏆', color: '#059669' },
];

// ===== RT/RW LEADERBOARD =====
export const leaderboardData = [
  { id: 1, name: 'RT 03 / RW 05', totalKg: 450, totalPoints: 45000, members: 28, rank: 1 },
  { id: 2, name: 'RT 01 / RW 02', totalKg: 380, totalPoints: 38000, members: 22, rank: 2 },
  { id: 3, name: 'RT 07 / RW 03', totalKg: 320, totalPoints: 32000, members: 19, rank: 3 },
  { id: 4, name: 'RT 02 / RW 01', totalKg: 290, totalPoints: 29000, members: 25, rank: 4 },
  { id: 5, name: 'RT 05 / RW 04', totalKg: 210, totalPoints: 21000, members: 15, rank: 5 },
];
