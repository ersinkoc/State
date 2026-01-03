/**
 * Real-world shopping cart example.
 *
 * Demonstrates:
 * - Complex state management
 * - Multiple actions
 * - Computed values (total)
 */

import { createStore, selector } from '@oxog/state';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  coupon: string | null;
  discount: number;
}

// Create cart store with computed values
const cartStore = createStore<CartState>({
  items: [],
  coupon: null,
  discount: 0,
})
  .use(
    selector({
      selectors: {
        // Computed: subtotal
        subtotal: (state) =>
          state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),

        // Computed: total after discount
        total: (state) => {
          const subtotal = state.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          return subtotal * (1 - state.discount / 100);
        },

        // Computed: item count
        itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    })
  )
  .action('addItem', (state, product: Product) => {
    const existing = state.items.find((item) => item.id === product.id);
    if (existing) {
      return {
        items: state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  })
  .action('removeItem', (state, productId: number) => ({
    items: state.items.filter((item) => item.id !== productId),
  }))
  .action('updateQuantity', (state, productId: number, quantity: number) => ({
    items: state.items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    ),
  }))
  .action('applyCoupon', (state, coupon: string, discount: number) => ({
    coupon,
    discount,
  }))
  .action('clear', () => ({
    items: [],
    coupon: null,
    discount: 0,
  }));

// Usage
cartStore.addItem({ id: 1, name: 'Laptop', price: 999 });
cartStore.addItem({ id: 2, name: 'Mouse', price: 29 });

console.log('Subtotal:', cartStore.getState().subtotal); // 1028
console.log('Item count:', cartStore.getState().itemCount); // 2

cartStore.applyCoupon('SAVE10', 10);
console.log('Total:', cartStore.getState().total); // 925.2
