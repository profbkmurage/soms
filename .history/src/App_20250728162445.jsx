import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Product from './components/Product'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import RefundPage from './components/RefundMode'
import ProtectedRoute from './routes/ProtectedRoute' 

const App = () => {
  const [editMode, setEditMode] = useState(false)
  const [addStockMode, setAddStockMode] = useState(false)
  const { currentUser } = useAuth()

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
  path='/signup'
  element={
    <ProtectedRoute>
      {currentUser?.email === 'bkmurage27@gmail.com' ? (
        <SignUp />
      ) : (
        <div className='text-center mt-5'>
          <h3>Access Denied</h3>
          <p>This page is restricted to the superadmin only.</p>
        </div>
      )}
    </ProtectedRoute>
  }
/>
<Route path='/settings' element={<ProtectedRoute>;<Settings />
</ProtectedRoute>} />

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
