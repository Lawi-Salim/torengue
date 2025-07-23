import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Charger le panier depuis localStorage au démarrage
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('userCommand');
    return stored ? JSON.parse(stored) : [];
  });

  // État global pour le modal panier
  const [showCartModal, setShowCartModal] = useState(false);

  // Synchroniser le panier avec localStorage à chaque modification
  React.useEffect(() => {
    localStorage.setItem('userCommand', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id_produit === product.id_produit);
      if (existingItem) {
        return prevItems.map(item =>
          item.id_produit === product.id_produit
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id_produit !== productId));
  };

  // Nouvelle fonction pour mettre à jour la quantité d'un produit
  const updateCartQuantity = (productId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems
        .map(item =>
          item.id_produit === productId
            ? { ...item, quantity: Math.max(1, newQuantity) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    showCartModal,
    openCartModal: () => setShowCartModal(true),
    closeCartModal: () => setShowCartModal(false)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
