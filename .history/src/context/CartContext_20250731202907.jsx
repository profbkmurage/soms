import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'

const CartContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  // 🔄 Load cart from localStorage on first render
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cartItems')
    return storedCart ? JSON.parse(storedCart) : []
  })

  //  Save cart to localStorage every time it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

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

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cartItems') // 🧹 Also clear from localStorage
  }

  // 👤 Listen to auth changes — clear cart if user logs out
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
