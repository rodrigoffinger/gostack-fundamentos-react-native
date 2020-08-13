import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@GoMarketplace:Cart');

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      let productsCart = [...products];

      const productIndex = productsCart.findIndex(x => x.id === product.id);

      console.log(`Product index: ${productIndex}`);

      if (productIndex > -1) {
        productsCart[productIndex].quantity += 1;
      } else {
        const productToAdd = product;
        productToAdd.quantity = 1;
        productsCart = [...products, productToAdd];
      }

      // productsCart = [];
      await AsyncStorage.setItem(
        '@GoMarketplace:Cart',
        JSON.stringify(productsCart),
      );

      setProducts(productsCart);

      console.log(productsCart);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsCart = [...products];

      const productIndex = productsCart.findIndex(x => x.id === id);

      if (productIndex > -1) {
        productsCart[productIndex].quantity += 1;
      }

      setProducts(productsCart);

      await AsyncStorage.setItem(
        '@GoMarketplace:Cart',
        JSON.stringify(productsCart),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsCart = [...products];

      const productIndex = productsCart.findIndex(x => x.id === id);

      if (productIndex > -1) {
        if (productsCart[productIndex].quantity === 1) {
          productsCart.splice(productIndex);
        } else {
          productsCart[productIndex].quantity -= 1;
        }
      }

      setProducts(productsCart);

      await AsyncStorage.setItem(
        '@GoMarketplace:Cart',
        JSON.stringify(productsCart),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
