export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  whatsapp_number: string | null
  role?: string | null
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  status?: string | null
  review_note?: string | null
  stock?: number | null
  created_at: string
}

// ── Cart types ────────────────────────────────────────────────────────────
export interface CartItem {
  product_id: string
  quantity: number
  price_at_addition: number
  name: string
  image_url: string | null
}

export interface Cart {
  cart_id: string
  user_id: string
  items: CartItem[]
  updated_at: string
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  image?: File | null
}

// ── Order types ──────────────────────────────────────────────────────────
export interface Order {
  id: string
  order_code: string
  user_id: string
  customer_name: string | null
  customer_email: string | null
  items: OrderItem[]
  total_amount: number
  payment_method: "midtrans" | "whatsapp"
  status: "pending" | "paid" | "completed" | "failed" | "expired" | "cancelled"
  whatsapp_note: string | null
  midtrans_transaction_id: string | null
  midtrans_payment_type: string | null
  snap_token: string | null
  paid_at: string | null
  completed_at: string | null
  created_at: string
}

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
}

export interface ProfileFormData {
  full_name: string
  bio: string
  whatsapp_number?: string
  avatar?: File | null
}

export interface AdminStats {
  totalUsers: number
  totalProducts: number
  pendingReviews: number
  approvedProducts: number
  rejectedProducts: number
  totalValue: number
}
