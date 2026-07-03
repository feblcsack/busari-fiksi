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
