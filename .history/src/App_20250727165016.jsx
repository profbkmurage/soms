import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Product from './components/Product'
import ProductList from './components/ProductList'
/ProductList'
import Cart from './components/Cart'
import RefundPage from './components/RefundMode'
import ProtectedRoute from './routes/ProtectedRoute' // ✅ import this

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
            <ProtectedRoute>
              <ProductList
                editMode={editMode}
                addStockMode={addStockMode}
                setEditMode={setEditMode}
                setAddStockMode={setAddStockMode}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path='/New-Product'
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path='/cart'
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path='/refund'
          element={
            <ProtectedRoute>
              <RefundPage
                onRefundComplete={() => {
                  // After refund, navigate elsewhere if needed
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route path='/login' element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
