import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

const API_BASE = '/api';

export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // login | register | otp
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
            const body = mode === 'register'
                ? { name: form.name, email: form.email, password: form.password, phone: form.phone }
                : { email: form.email, password: form.password };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || Object.values(data.errors || {}).flat().join(', ') || 'Terjadi kesalahan');
                return;
            }

            localStorage.setItem('auth_token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            if (mode === 'register') {
                setMode('otp');
            } else {
                const userRole = data.data.user?.role;
                if (userRole === 'kurir') navigate('/app/courier');
                else if (userRole === 'mitra') navigate('/app/partner');
                else navigate('/app');
            }
        } catch (err) {
            setError('Gagal terhubung ke server.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ otp }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'OTP salah');
                return;
            }
            navigate('/app');
        } catch (err) {
            setError('Gagal verifikasi OTP.');
        } finally {
            setLoading(false);
        }
    };

    // OTP Screen
    if (mode === 'otp') {
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="login-brand">
                        <div className="login-logo"><Recycle size={28} /></div>
                        <h1>Verifikasi OTP</h1>
                        <p>Masukkan 6 digit kode verifikasi</p>
                    </div>
                    <form onSubmit={handleOtp} className="login-form">
                        {error && <div className="login-error">{error}</div>}
                        <div className="login-input-group">
                            <ShieldCheck size={18} />
                            <input
                                type="text"
                                placeholder="Masukkan OTP (123456)"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Memverifikasi...' : 'Verifikasi'} <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Brand */}
                <div className="login-brand">
                    <div className="login-logo"><Recycle size={28} /></div>
                    <h1>LumbungHijau</h1>
                    <p>{mode === 'login' ? 'Masuk ke akunmu' : 'Buat akun baru'}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    {mode === 'register' && (
                        <>
                            <div className="login-input-group">
                                <User size={18} />
                                <input
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="login-input-group">
                                <Phone size={18} />
                                <input
                                    type="text"
                                    placeholder="No. WhatsApp"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <div className="login-input-group">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Memproses...' : (mode === 'login' ? 'Masuk' : 'Daftar')}
                        <ArrowRight size={18} />
                    </button>
                </form>

                {/* Toggle */}
                <div className="login-toggle">
                    {mode === 'login' ? (
                        <p>Belum punya akun? <button onClick={() => { setMode('register'); setError(''); }}>Daftar</button></p>
                    ) : (
                        <p>Sudah punya akun? <button onClick={() => { setMode('login'); setError(''); }}>Masuk</button></p>
                    )}
                </div>

                {/* Demo hint */}
                <div className="login-demo-hint">
                    <p>👤 Warga: <strong>ahmad@lumbunghijau.id</strong></p>
                    <p>🚛 Kurir: <strong>joko@kurir.id</strong></p>
                    <p>🏪 Mitra: <strong>tini@mitra.id</strong></p>
                    <p>🔑 Pass: <strong>password</strong></p>
                </div>
            </div>
        </div>
    );
}
