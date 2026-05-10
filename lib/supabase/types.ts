export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          canonical_url: string | null
          category_id: string | null
          content: string | null
          cover_image_alt: string | null
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          focus_keyword: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_post_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content?: string | null
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          focus_keyword?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_post_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content?: string | null
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          focus_keyword?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_post_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
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
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          nom: string
          objet: string | null
          telephone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          nom: string
          objet?: string | null
          telephone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          nom?: string
          objet?: string | null
          telephone?: string | null
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
      hero_banners: {
        Row: {
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          start_date: string
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          start_date: string
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          start_date?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          content: string
          created_at: string
          id: string
          recipients_count: number
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          recipients_count?: number
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipients_count?: number
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          promo_sent: boolean | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          promo_sent?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          promo_sent?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
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
          order_number: string
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
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_attributes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          product_id: string
          values: string[]
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          product_id: string
          values?: string[]
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          product_id?: string
          values?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string | null
          id: string
          is_main: boolean | null
          position: number | null
          product_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string | null
          id?: string
          is_main?: boolean | null
          position?: number | null
          product_id: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string | null
          id?: string
          is_main?: boolean | null
          position?: number | null
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          combination: Json
          created_at: string | null
          enabled: boolean | null
          id: string
          price: number | null
          product_id: string
          sku: string | null
          stock_quantity: number | null
        }
        Insert: {
          combination?: Json
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          price?: number | null
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Update: {
          combination?: Json
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          price?: number | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          canonical_url: string | null
          category: Database["public"]["Enums"]["product_category"] | null
          created_at: string | null
          currency: string | null
          description: string | null
          featured: boolean | null
          focus_keyword: string | null
          id: string
          in_stock: boolean | null
          low_stock_threshold: number | null
          manage_stock: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          price: number
          regular_price: number | null
          sale_price: number | null
          short_description: string | null
          sku: string | null
          slug: string
          sort_order: number | null
          status: Database["public"]["Enums"]["product_status"] | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string | null
          weight_grams: number | null
        }
        Insert: {
          canonical_url?: string | null
          category?: Database["public"]["Enums"]["product_category"] | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          featured?: boolean | null
          focus_keyword?: string | null
          id?: string
          in_stock?: boolean | null
          low_stock_threshold?: number | null
          manage_stock?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          price?: number
          regular_price?: number | null
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Update: {
          canonical_url?: string | null
          category?: Database["public"]["Enums"]["product_category"] | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          featured?: boolean | null
          focus_keyword?: string | null
          id?: string
          in_stock?: boolean | null
          low_stock_threshold?: number | null
          manage_stock?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          price?: number
          regular_price?: number | null
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Relationships: []
      }
      promo_usage: {
        Row: {
          email: string
          id: string
          promo_code: string
          stripe_session_id: string | null
          used_at: string
        }
        Insert: {
          email: string
          id?: string
          promo_code: string
          stripe_session_id?: string | null
          used_at?: string
        }
        Update: {
          email?: string
          id?: string
          promo_code?: string
          stripe_session_id?: string | null
          used_at?: string
        }
        Relationships: []
      }
      shipping_methods: {
        Row: {
          cost: number
          created_at: string | null
          enabled: boolean | null
          free_above: number | null
          id: string
          name: string
          requires_signature: boolean | null
          sort_order: number | null
          zone_id: string
        }
        Insert: {
          cost?: number
          created_at?: string | null
          enabled?: boolean | null
          free_above?: number | null
          id?: string
          name: string
          requires_signature?: boolean | null
          sort_order?: number | null
          zone_id: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          enabled?: boolean | null
          free_above?: number | null
          id?: string
          name?: string
          requires_signature?: boolean | null
          sort_order?: number | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_methods_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zone_postcodes: {
        Row: {
          country: string
          id: string
          postcode_pattern: string
          zone_id: string
        }
        Insert: {
          country?: string
          id?: string
          postcode_pattern: string
          zone_id: string
        }
        Update: {
          country?: string
          id?: string
          postcode_pattern?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_zone_postcodes_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      textile_highlights: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          position: number | null
          product_link: string | null
          product_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          position?: number | null
          product_link?: string | null
          product_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          position?: number | null
          product_link?: string | null
          product_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      blog_post_status: "publish" | "draft"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      product_category:
        | "magnets"
        | "stickers"
        | "textile"
        | "goodies"
        | "decoration"
        | "uncategorized"
      product_status: "publish" | "draft" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      blog_post_status: ["publish", "draft"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      product_category: [
        "magnets",
        "stickers",
        "textile",
        "goodies",
        "decoration",
        "uncategorized",
      ],
      product_status: ["publish", "draft", "private"],
    },
  },
} as const
