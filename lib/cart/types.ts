export type CartItem = {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  variantLabel?: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Cart = {
  items: CartItem[];
  total: number;
  count: number;
};
