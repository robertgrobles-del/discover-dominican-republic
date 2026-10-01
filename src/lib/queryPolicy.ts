export const queryStaleTime = {
  catalog: 5 * 60_000,
  cart: 30_000,
  orders: 30_000,
  reservations: 30_000,
} as const;

export const queryKeys = {
  cart: (userId?: string) => ["cart", userId] as const,
  reservations: (userId?: string) => ["my-reservations", userId] as const,
  store: {
    all: ["store"] as const,
    products: ["store", "products"] as const,
    product: (slug?: string) => ["store", "product", slug] as const,
    orders: ["store", "orders"] as const,
  },
} as const;
