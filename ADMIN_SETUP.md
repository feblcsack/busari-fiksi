# Setup Admin Busari

## 1. Jalankan SQL di Supabase Dashboard

Buka **Supabase Dashboard → SQL Editor** dan jalankan query berikut:

```sql
-- Tambah kolom role ke tabel profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Tambah kolom status dan review_note ke tabel products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS review_note TEXT DEFAULT NULL;

-- Buat index untuk performa query status
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
```

## 2. Set Akun Anda Sebagai Admin

Masih di SQL Editor, ganti `your-email@example.com` dengan email Google Anda:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Atau jika Anda tahu user ID Anda (dari Supabase Auth → Users):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'your-user-uuid-here';
```

## 3. Verifikasi

```sql
-- Pastikan role sudah terupdate
SELECT id, full_name, email, role FROM profiles WHERE role = 'admin';
```

## 4. Akses Admin Panel

Setelah SQL dijalankan dan role diset:

→ Buka: **http://localhost:3000/admin**

Login dengan akun Google yang sudah diset sebagai admin.

## Fitur Admin Panel

| Halaman | URL | Fungsi |
|---------|-----|--------|
| Overview | `/admin` | Statistik platform |
| Semua Produk | `/admin/products` | CRUD semua produk |
| Review | `/admin/reviews` | Approve/Reject produk |
| Pengguna | `/admin/users` | Kelola role user |
| Diagnostik | `/admin/diagnostics` | Analisis kesehatan platform |

## Catatan Penting

- Hanya akun dengan `role = 'admin'` di tabel `profiles` yang bisa mengakses `/admin`
- Produk yang di-approve akan muncul di halaman Shop
- Produk lama (tanpa kolom status) otomatis tampil di Shop
- Untuk mencabut akses admin: `UPDATE profiles SET role = 'user' WHERE email = 'xxx'`
