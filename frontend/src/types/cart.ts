export interface CartItem {
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  size?: string;
  color?: string;
}
