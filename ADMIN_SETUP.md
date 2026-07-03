# Setup Admin Busari

## 1. Jalankan SQL di Supabase Dashboard

Buka **Supabase Dashboard → SQL Editor** dan jalankan query berikut:

```sql
-- Tambah kolom role ke tabel profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Tambah kolom status dan review_note ke tabel products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS review_note TEXT DEFAULT NULL;

-- Buat index untuk performa query status
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Set semua produk LAMA (yang belum punya status) ke 'approved'
-- agar langsung tampil di shop tanpa perlu review ulang
UPDATE products SET status = 'approved' WHERE status IS NULL;
```

## 2. Set Akun Anda Sebagai Admin

Masih di SQL Editor, ganti dengan email Google Anda:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## 3. Verifikasi

```sql
-- Pastikan role sudah terupdate
SELECT id, full_name, email, role FROM profiles WHERE role = 'admin';

-- Cek status produk
SELECT status, COUNT(*) FROM products GROUP BY status;
```

## 4. Akses Admin Panel

→ Buka: **http://localhost:3000/admin**

---

## Alur Review Produk (Seller → Admin → Shop)

```
Seller tambah produk
       ↓
  status = "pending"
  (muncul di dashboard seller dengan badge "Menunggu Review")
       ↓
Admin review di /admin/reviews
       ↓
  ┌─── Setujui ──→ status = "approved" → tampil di /shop
  └─── Tolak ───→ status = "rejected" + catatan → seller diperbaiki
```

- **Seller** melihat status setiap produk di `/dashboard/products` (badge Pending/Disetujui/Ditolak)
- **Dashboard seller** menampilkan banner notifikasi jika ada produk pending atau rejected
- **Admin** mendapat badge angka di sidebar menu "Review Produk" untuk produk pending
- **Shop** hanya menampilkan produk `approved` (dan produk lama tanpa status)

---

## Fitur Admin Panel

| Halaman | URL | Fungsi |
|---------|-----|--------|
| Overview | `/admin` | Statistik + antrian review live |
| Semua Produk | `/admin/products` | CRUD + approve/reject inline |
| Review Produk | `/admin/reviews` | Review dengan catatan per produk |
| Pengguna | `/admin/users` | Kelola role user |
| Diagnostik | `/admin/diagnostics` | Analisis kesehatan platform |

## Catatan Penting

- Hanya akun dengan `role = 'admin'` di tabel `profiles` yang bisa mengakses `/admin`
- Produk **baru** otomatis masuk status `pending` — seller tidak bisa bypass
- Produk **lama** (sebelum migration) perlu di-set `approved` via SQL di atas
- Untuk mencabut akses admin: `UPDATE profiles SET role = 'user' WHERE email = 'xxx'`
