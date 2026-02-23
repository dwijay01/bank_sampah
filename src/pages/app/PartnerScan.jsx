import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ArrowLeft, CheckCircle, XCircle, ScanLine, Gift, User, AlertCircle } from 'lucide-react';
import authFetch from '../../utils/authFetch';

export default function PartnerScan() {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [scanResult, setScanResult] = useState(null); // Validated voucher data
    const [scanError, setScanError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);

    // Simulated QR parsing for development fallback
    const [manualCode, setManualCode] = useState('');

    const handleScan = async (text) => {
        if (!text) return;
        setScannedData(text);
        validateVoucher(text);
    };

    const validateVoucher = async (qrToken) => {
        setLoading(true);
        setScanError(null);
        setScanResult(null);
        try {
            const res = await authFetch('/api/partner/validate-voucher', {
                method: 'POST',
                body: JSON.stringify({ qr_token: qrToken })
            });
            setScanResult(res.data);
        } catch (error) {
            setScanError(error.message || 'QR Code Tidak Valid atau Gagal dipindai');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!scanResult) return;
        setClaiming(true);
        try {
            const res = await authFetch('/api/partner/claim-voucher', {
                method: 'POST',
                body: JSON.stringify({ voucher_id: scanResult.voucher_id })
            });
            alert(res.message);
            navigate('/app/partner');
        } catch (error) {
            alert(error.message || 'Gagal mengklaim voucher');
        } finally {
            setClaiming(false);
        }
    };

    const resetScan = () => {
        setScannedData(null);
        setScanResult(null);
        setScanError(null);
        setManualCode('');
    };

    return (
        <div className="mobile-page bg-gray-900 min-h-screen flex flex-col text-white">
            {/* Header */}
            <div className="bg-gray-800 p-4 flex items-center gap-4 sticky top-0 z-50 shadow-md">
                <button onClick={() => navigate('/app/partner')} className="p-2 bg-gray-700 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold flex-1">Scan Voucher Warga</h1>
            </div>

            {/* Scanner Area */}
            <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                {!scannedData ? (
                    <>
                        <div className="flex-1 w-full bg-black relative">
                            <Scanner
                                onResult={(text, result) => handleScan(text)}
                                onError={(e) => console.log(e)}
                                options={{ delayBetweenScanSuccess: 2000 }}
                                components={{ audio: false, finder: false }}
                            />
                            {/* Custom Overlay targeting center */}
                            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl text-emerald-400"></div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>

                                    {/* Scan Line Animation */}
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[scan_2s_ease-in-out_infinite_alternate]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Scanner Hint */}
                        <div className="absolute bottom-32 left-0 right-0 text-center z-20 pointer-events-none">
                            <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10">
                                <ScanLine size={16} className="text-emerald-400 animate-pulse" />
                                Arahkan kamera ke QR Code Voucher
                            </div>
                        </div>

                        {/* Fallback Input */}
                        <div className="absolute bottom-6 left-6 right-6 z-20">
                            <div className="bg-gray-800/90 backdrop-blur p-1 rounded-2xl flex gap-1 border border-gray-700">
                                <input
                                    type="text"
                                    placeholder="Simulasi Token (Misal: ABC123XYZ)"
                                    className="flex-1 bg-transparent text-white px-4 py-3 outline-none text-sm"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                />
                                <button
                                    onClick={() => handleScan(manualCode || 'DUMMY')}
                                    className="px-4 bg-emerald-600 text-white rounded-xl font-bold text-sm"
                                >
                                    Cek
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 bg-gray-50 flex flex-col items-center p-6 justify-center">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4 text-gray-500">
                                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="font-medium animate-pulse">Memvalidasi Voucher...</p>
                            </div>
                        ) : scanError ? (
                            <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex flex-col items-center justify-center mb-4">
                                    <XCircle size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Validasi Gagal</h2>
                                <p className="text-red-500 bg-red-50 p-3 rounded-xl w-full text-sm mb-6 border border-red-100">{scanError}</p>
                                <button
                                    onClick={resetScan}
                                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Scan Ulang
                                </button>
                            </div>
                        ) : scanResult ? (
                            <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-100">
                                <div className="bg-emerald-50 p-6 flex flex-col items-center text-center border-b border-emerald-100">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h2 className="text-xl font-bold text-emerald-800">Voucher Valid!</h2>
                                    <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800">
                                        STATUS: {scanResult.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                                            {scanResult.reward_image ? (
                                                <img src={scanResult.reward_image} alt="Reward" className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <Gift size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Barang Penukaran:</p>
                                            <p className="font-bold text-gray-800 leading-tight">{scanResult.reward_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Milik Warga:</p>
                                            <p className="font-bold text-gray-800">{scanResult.user_name}</p>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl flex gap-3 text-yellow-800 text-sm mb-6">
                                        <AlertCircle size={20} className="flex-shrink-0 text-yellow-500" />
                                        <p>Pastikan Anda memberikan barang sesuai dengan nama barang di atas. Jika sudah, tekan tombol Klaim di bawah.</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={resetScan}
                                            className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold border border-gray-200"
                                            disabled={claiming}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleClaim}
                                            disabled={claiming}
                                            className="flex-[2] py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex justify-center items-center"
                                        >
                                            {claiming ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                "Selesaikan Penukaran"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
            {/* Inject small animation styles directly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
            `}} />
        </div>
    );
}
