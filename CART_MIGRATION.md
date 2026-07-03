# Cart & Stock Migration

Run this SQL in Supabase Dashboard → SQL Editor to enable the cart and stock features.

## 1. Add `stock` column to products table

```sql
-- Add stock field to products (nullable = no stock tracking)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock integer DEFAULT NULL;
```

## 2. Create `carts` table

```sql
-- Create carts table (one cart per user)
CREATE TABLE IF NOT EXISTS carts (
  cart_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items     jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own cart
CREATE POLICY "cart_select_own"
  ON carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "cart_insert_own"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_update_own"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_delete_own"
  ON carts FOR DELETE
  USING (auth.uid() = user_id);
```

## 3. Harden product status security (prevent non-admin from setting status)

```sql
-- Drop existing policy if any
DROP POLICY IF EXISTS "products_update_status_admin_only" ON products;

-- Only allow admin to write the status field directly via a function
-- (In practice, seller updates go through server actions which strip the status field)
-- This policy ensures no client-side bypass:
CREATE POLICY "products_update_own"
  ON products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Sellers cannot escalate status to 'approved' directly
    AND (status IS NULL OR status IN ('pending', 'queued', 'rejected'))
  );
```

> Note: Admin actions use the service role key (via server actions), which bypasses RLS entirely.
> The `requireAdmin()` guard in `src/actions/admin.ts` enforces roFle checks at the application layer.
