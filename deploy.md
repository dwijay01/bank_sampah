# Panduan Deployment Docker (LumbungHijau) ke VPS

Dokumen ini berisi langkah-langkah untuk mendeploy aplikasi LumbungHijau ke server VPS (Ubuntu/Debian) menggunakan Docker.

## Prasyarat Server
1. Akses SSH ke VPS.
2. RAM minimal 1GB (Disarankan 2GB).
3. Terinstal Docker dan Docker Compose.

---

## Langkah 1: Persiapan di VPS
Masuk ke VPS Anda via SSH dan clone/copy source code aplikasi ini.
Paling mudah, Anda bisa zip folder project ini (tanpa `node_modules` dan `vendor`), upload via SFTP, lalu unzip di server.

Atau via GitHub (Jika menggunakan repo git):
```bash
git clone https://github.com/username/lumbung_hijau.git
cd lumbung_hijau
```

## Langkah 2: Konfigurasi Environment (Penting)
Aplikasi Laravel butuh file `.env`. Di server, salin dari `.env.example`:
```bash
cd backend
cp .env.example .env
```

Edit file `.env` di backend (misal pakai `nano .env`):
Ubah bagian-bagian penting berikut:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://lumbung.alipayment.id
ASSET_URL=https://lumbung.alipayment.id
FORCE_HTTPS=true

# Konfigurasi Database (Biarkan SQLite)
DB_CONNECTION=sqlite

# Sanctum Auth (Sangat penting agar login tidak error via HTTPS)
SANCTUM_STATEFUL_DOMAINS="lumbung.alipayment.id"
SESSION_DOMAIN=".lumbung.alipayment.id"
```

Sekarang kembali ke root project:
```bash
cd ..
```

## Langkah 3: Build & Start Containers
Jalankan perintah ini di root folder (sejajar dengan file `docker-compose.yml`):

```bash
docker-compose up -d --build
```
*Proses ini akan mendownload image PHP dan Node, lalu meng-generate build React. Tunggu beberapa menit hingga selesai.*

## Langkah 4: Generate Key & Migrate Database
Setelah container jalan, kita perlu menjalankan command artisannya sekali:

```bash
# Generate APP_KEY
docker-compose exec backend php artisan key:generate

# Menjalankan migrasi database & seeder
docker-compose exec backend php artisan migrate:fresh --seed
```

## Langkah 5: Storage Link
Izinkan Nginx mengakses file gambar/upload dari Laravel:
```bash
docker-compose exec backend php artisan storage:link
```

---

## Langkah 6: Konfigurasi Cloudflare Tunnel
Karena Anda menggunakan `cloudflared` di VPS, arahkan Public Hostname ke port dimana Nginx terekspos.

Buka Dashboard **Cloudflare Zero Trust** -> **Networks** -> **Tunnels**:
1. Pilih Tunnel VPS Anda.
2. Ke bagian **Public Hostname**.
3. Tambahkan route baru:
   - **Subdomain**: `lumbung`
   - **Domain**: `alipayment.id`
   - **Service Type**: `HTTP`
   - **URL**: `localhost:80` (Atau `127.0.0.1:80`)
4. Simpan (Save hostname).

---

## Verifikasi
Buka browser dan akses URL Anda:
👉 **`https://lumbung.alipayment.id`**

Aplikasi sekarang sudah terhubung dengan aman. Nginx melayani file web React dari lokal, sementara koneksi HTTPS (SSL) secara otomatis diamankan (di-*terminate*) oleh jaringan Cloudflare ke VPS Anda!
