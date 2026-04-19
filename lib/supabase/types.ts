export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_nav_featured: boolean | null
          name: string
          nav_color: string | null
          nav_label: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_nav_featured?: boolean | null
          name: string
          nav_color?: string | null
          nav_label?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_nav_featured?: boolean | null
          name?: string
          nav_color?: string | null
          nav_label?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          addresses: Json[] | null
          auth_user_id: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          addresses?: Json[] | null
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          addresses?: Json[] | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
          variant_id: string | null
          variant_label: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total: number
          unit_price: number
          variant_id?: string | null
          variant_label?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          unit_price?: number
          variant_id?: string | null
          variant_label?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          order_number: string
          shipping_address: Json | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      product_attributes: {
        Row: { created_at: string | null; id: string; name: string; product_id: string; values: string[] }
        Insert: { created_at?: string | null; id?: string; name: string; product_id: string; values?: string[] }
        Update: { created_at?: string | null; id?: string; name?: string; product_id?: string; values?: string[] }
        Relationships: []
      }
      product_images: {
        Row: { alt: string | null; created_at: string | null; id: string; is_main: boolean | null; position: number | null; product_id: string; url: string }
        Insert: { alt?: string | null; created_at?: string | null; id?: string; is_main?: boolean | null; position?: number | null; product_id: string; url: string }
        Update: { alt?: string | null; created_at?: string | null; id?: string; is_main?: boolean | null; position?: number | null; product_id?: string; url?: string }
        Relationships: []
      }
      product_variants: {
        Row: { combination: Json; created_at: string | null; enabled: boolean | null; id: string; price: number | null; product_id: string; sku: string | null; stock_quantity: number | null }
        Insert: { combination?: Json; created_at?: string | null; enabled?: boolean | null; id?: string; price?: number | null; product_id: string; sku?: string | null; stock_quantity?: number | null }
        Update: { combination?: Json; created_at?: string | null; enabled?: boolean | null; id?: string; price?: number | null; product_id?: string; sku?: string | null; stock_quantity?: number | null }
        Relationships: []
      }
      products: {
        Row: {
          canonical_url: string | null; category: Database["public"]["Enums"]["product_category"] | null; created_at: string | null; currency: string | null; description: string | null; featured: boolean | null; focus_keyword: string | null; id: string; in_stock: boolean | null; low_stock_threshold: number | null; manage_stock: boolean | null; meta_description: string | null; meta_title: string | null; name: string; price: number; regular_price: number | null; sale_price: number | null; short_description: string | null; sku: string | null; slug: string; sort_order: number | null; status: Database["public"]["Enums"]["product_status"] | null; stock_quantity: number | null; tags: string[] | null; updated_at: string | null; weight_grams: number | null
        }
        Insert: {
          canonical_url?: string | null; category?: Database["public"]["Enums"]["product_category"] | null; created_at?: string | null; currency?: string | null; description?: string | null; featured?: boolean | null; focus_keyword?: string | null; id?: string; in_stock?: boolean | null; low_stock_threshold?: number | null; manage_stock?: boolean | null; meta_description?: string | null; meta_title?: string | null; name: string; price?: number; regular_price?: number | null; sale_price?: number | null; short_description?: string | null; sku?: string | null; slug: string; sort_order?: number | null; status?: Database["public"]["Enums"]["product_status"] | null; stock_quantity?: number | null; tags?: string[] | null; updated_at?: string | null; weight_grams?: number | null
        }
        Update: {
          canonical_url?: string | null; category?: Database["public"]["Enums"]["product_category"] | null; created_at?: string | null; currency?: string | null; description?: string | null; featured?: boolean | null; focus_keyword?: string | null; id?: string; in_stock?: boolean | null; low_stock_threshold?: number | null; manage_stock?: boolean | null; meta_description?: string | null; meta_title?: string | null; name?: string; price?: number; regular_price?: number | null; sale_price?: number | null; short_description?: string | null; sku?: string | null; slug?: string; sort_order?: number | null; status?: Database["public"]["Enums"]["product_status"] | null; stock_quantity?: number | null; tags?: string[] | null; updated_at?: string | null; weight_grams?: number | null
        }
        Relationships: []
      }
      shipping_methods: {
        Row: { cost: number; created_at: string | null; enabled: boolean | null; free_above: number | null; id: string; name: string; requires_signature: boolean | null; sort_order: number | null; zone_id: string }
        Insert: { cost?: number; created_at?: string | null; enabled?: boolean | null; free_above?: number | null; id?: string; name: string; requires_signature?: boolean | null; sort_order?: number | null; zone_id: string }
        Update: { cost?: number; created_at?: string | null; enabled?: boolean | null; free_above?: number | null; id?: string; name?: string; requires_signature?: boolean | null; sort_order?: number | null; zone_id?: string }
        Relationships: []
      }
      shipping_zone_postcodes: {
        Row: { country: string; id: string; postcode_pattern: string; zone_id: string }
        Insert: { country?: string; id?: string; postcode_pattern: string; zone_id: string }
        Update: { country?: string; id?: string; postcode_pattern?: string; zone_id?: string }
        Relationships: []
      }
      shipping_zones: {
        Row: { created_at: string | null; description: string | null; enabled: boolean | null; id: string; name: string; sort_order: number | null; updated_at: string | null }
        Insert: { created_at?: string | null; description?: string | null; enabled?: boolean | null; id?: string; name: string; sort_order?: number | null; updated_at?: string | null }
        Update: { created_at?: string | null; description?: string | null; enabled?: boolean | null; id?: string; name?: string; sort_order?: number | null; updated_at?: string | null }
        Relationships: []
      }
      shop_settings: {
        Row: { id: string; key: string; updated_at: string | null; value: Json }
        Insert: { id?: string; key: string; updated_at?: string | null; value: Json }
        Update: { id?: string; key?: string; updated_at?: string | null; value?: Json }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      order_status: "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled" | "refunded"
      product_category: "magnets" | "stickers" | "textile" | "goodies" | "decoration" | "uncategorized"
      product_status: "publish" | "draft" | "private"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends T extends { schema: keyof DatabaseWithoutInternals } ? keyof (DatabaseWithoutInternals[T["schema"]]["Tables"] & DatabaseWithoutInternals[T["schema"]]["Views"]) : never = never,
> = T extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[T["schema"]]["Tables"] & DatabaseWithoutInternals[T["schema"]]["Views"])[TableName] extends { Row: infer R } ? R : never
  : T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never
    : never

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends T extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[T["schema"]]["Tables"] : never = never,
> = T extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[T["schema"]]["Tables"][TableName] extends { Insert: infer I } ? I : never
  : T extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never
    : never

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends T extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[T["schema"]]["Tables"] : never = never,
> = T extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[T["schema"]]["Tables"][TableName] extends { Update: infer U } ? U : never
  : T extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
    : never

export type Enums<
  T extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends T extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[T["schema"]]["Enums"] : never = never,
> = T extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[T["schema"]]["Enums"][EnumName]
  : T extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][T]
    : never
