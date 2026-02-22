const API_BASE = '/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    const res = await fetch(url, config);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Network error' }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

// ===== DASHBOARD =====
export const getDashboardStats = () => request('/dashboard/stats');
export const getDepositTrend = () => request('/dashboard/deposit-trend');
export const getWasteDistribution = () => request('/dashboard/waste-distribution');

// ===== TRANSACTIONS =====
export const getTransactions = (params = '') => request(`/transactions${params ? '?' + params : ''}`);
export const createTransaction = (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) });
export const processTransaction = (id) => request(`/transactions/${id}/process`, { method: 'PATCH' });

// ===== PICKUP REQUESTS =====
export const getPickupRequests = () => request('/pickup-requests');
export const assignCourier = (id, courierId) => request(`/pickup-requests/${id}/assign`, { method: 'POST', body: JSON.stringify({ courier_id: courierId }) });
export const getCouriers = () => request('/couriers');

// ===== WASTE TYPES =====
export const getWasteTypes = () => request('/waste-types');
export const updateWasteType = (id, pricePerKg) => request(`/waste-types/${id}`, { method: 'PUT', body: JSON.stringify({ price_per_kg: pricePerKg }) });

// ===== WITHDRAWAL REQUESTS =====
export const getWithdrawalRequests = () => request('/withdrawal-requests');
export const approveWithdrawal = (id) => request(`/withdrawal-requests/${id}/approve`, { method: 'POST' });
export const rejectWithdrawal = (id) => request(`/withdrawal-requests/${id}/reject`, { method: 'POST' });

// ===== WARUNG PARTNERS =====
export const getWarungPartners = () => request('/warung-partners');
export const createWarungPartner = (data) => request('/warung-partners', { method: 'POST', body: JSON.stringify(data) });

// ===== USER LEVELS =====
export const getUserLevels = () => request('/user-levels');
export const updateUserLevel = (id, data) => request(`/user-levels/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ===== LEADERBOARD =====
export const getLeaderboard = () => request('/leaderboard');
export const createRtRwGroup = (data) => request('/leaderboard', { method: 'POST', body: JSON.stringify(data) });
