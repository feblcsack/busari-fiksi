export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  created_at: string
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
  avatar?: File | null
}
