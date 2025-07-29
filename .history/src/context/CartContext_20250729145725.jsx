import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'

const CartContext = createContext()

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

  const removeFromCart = productId => {
    setCartItems(prev => prev.filter(item => item.productId !== productId))
  }

  const clearCart = () => setCartItems([])

  // 🔄 Automatically clear cart when user logs out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        clearCart()
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
