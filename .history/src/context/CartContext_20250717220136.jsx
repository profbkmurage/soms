import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product, qty) => {
    const existing = cartItems.find(
      item => item.productId === product.productId
    )
    if (existing) {
      setCartItems(prev =>
        prev.map(item =>
          item.productId === product.productId
            ? { ...item, qty: item.qty + qty }
            : item
        )
      )
    } else {
      setCartItems(prev => [...prev, { ...product, qty }])
    }
  }

  const clearCart = () => setCartItems([])

  return (
    <CartContext.Provider value={{ cartItems, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
