# Terms & Conditions Modal Implementation

## Overview
Implementasi pop-up Syarat & Ketentuan yang muncul di beberapa titik penting seperti website profesional.

## Files Created

### 1. `/src/components/terms/terms-modal.tsx`
Komponen modal reusable untuk menampilkan Terms & Conditions dengan dua mode:
- **info**: Hanya menampilkan informasi (tombol "Mengerti")
- **consent**: Memerlukan persetujuan user (tombol "Nanti Saja" & "Saya Setuju")

Features:
- Scroll tracking - tombol "Saya Setuju" hanya aktif setelah user scroll 80% konten
- Responsive design
- Smooth animations
- Link ke halaman full terms (/terms)

### 2. `/src/hooks/use-terms-modal.ts`
Custom hook untuk manage state modal:
- Check localStorage untuk tracking apakah user sudah accept terms
- Versioning system (saat terms update, user diminta accept lagi)
- Auto-show modal setelah 1 detik di first visit

### 3. `/src/components/terms/first-visit-modal.tsx`
Client component wrapper untuk landing page (server component).

## Integration Points

### 1. ✅ First Visit (Landing Page)
**File**: `/src/app/page.tsx`
- Modal muncul 1 detik setelah user buka website pertama kali
- Menggunakan localStorage untuk tracking
- Mode: `consent` (harus accept)

### 2. ✅ Before Login
**File**: `/src/components/auth/login-button.tsx`
- Check terms accepted sebelum proses login
- Jika belum accept, show modal dulu
- Mode: `consent`

### 3. ✅ Before Checkout (QRIS/Midtrans)
**File**: `/src/components/cart/cart-drawer.tsx`
- Check terms accepted sebelum proses pembayaran QRIS
- Jika belum accept, show modal dulu
- Mode: `consent`

### 4. ✅ Before WhatsApp Order
**File**: `/src/components/cart/cart-drawer.tsx`
- Check terms accepted sebelum buat order WhatsApp
- Jika belum accept, show modal dulu
- Mode: `consent`

## User Flow

```
User buka website
  ↓
Modal muncul (delay 1s) → User accept → localStorage saved
  ↓
User mau login
  ↓
Check localStorage → Sudah accept? Ya → Proceed to login
                                 ↓ Tidak → Show modal → Accept → Login
  ↓
User mau checkout
  ↓
Check localStorage → Sudah accept? Ya → Proceed to payment
                                 ↓ Tidak → Show modal → Accept → Payment
```

## localStorage Key
- Key: `busari_terms_accepted`
- Value: `v1_2026` (version string)

## Styling
- Warna brand: `#6B4E2A` (brown)
- Background: `#FFF8F3` (cream)
- Font: Hanken Grotesk & Libre Caslon Text
- Animasi smooth dengan transitions

## How to Update Terms

1. Update konten di `/src/app/terms/page.tsx` (halaman full terms)
2. Update ringkasan di `/src/components/terms/terms-modal.tsx`
3. Ubah `TERMS_VERSION` di `/src/hooks/use-terms-modal.ts` (contoh: `v2_2026`)
4. User yang sudah pernah accept akan diminta accept lagi

## Notes

- Modal bersifat non-intrusive untuk user yang sudah pernah accept
- Desain sesuai dengan brand Busari (warm, traditional, professional)
- Fully accessible dengan proper ARIA labels
- Mobile responsive
