import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Product from './components/Product'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import RefundPage from './components/RefundMode' // ✅ Add this

const App = () => {
  const [editMode, setEditMode] = useState(false)
  const [addStockMode, setAddStockMode] = useState(false)

  return (
    <Router>
      <Navbar
        editMode={editMode}
        addStockMode={addStockMode}
        onToggleEdit={() => setEditMode(prev => !prev)}
        onToggleAddStock={() => setAddStockMode(prev => !prev)}
      />

      <Routes>
        <Route
          path='/'
          element={
            <ProductList
              editMode={editMode}
              addStockMode={addStockMode}
              setEditMode={setEditMode}
              setAddStockMode={setAddStockMode}
            />
          }
        />
        <Route
          path='/New - Product'
          element={<Product />}
        />
        <Route path='/cart' element={<Cart />} />
        <Route
          path='/refund'
          element={
            <RefundPage
              onRefundComplete={() => {
                // After refund, navigate elsewhere if needed
              }}
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
