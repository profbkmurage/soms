import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cartItems')
    return storedCart ? JSON.parse(storedCart) : []
  })

  const [companyName, setCompanyName] = useState('')

  // Save cart to localStorage when it changes
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
    localStorage.removeItem('cartItems')
  }

  // Listen for auth changes & fetch company name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        clearCart()
        setCompanyName('')
        return
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setCompanyName(data.companyName || '')
        }
      } catch (error) {
        console.error('Error fetching company name:', error)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, companyName }}
    >
      {children}
    </CartContext.Provider>
  )
}
