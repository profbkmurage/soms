import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Settings from './pages/settingstting'

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
  const [superAdmins, setSuperAdmins] = useState([])

  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchSuperAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'))
        const admins = snapshot.docs
          .map(doc => doc.data())
          .filter(user => user.role === 'superadmin')
          .map(user => user.email)
        setSuperAdmins(admins)
      } catch (err) {
        console.error('Error fetching superadmins:', err)
      }
    }

    fetchSuperAdmins()
  }, [])

  const isSuperadmin = currentUser && superAdmins.includes(currentUser.email)

  return (
    <Router>
      <Navbar
        editMode={editMode}
        addStockMode={addStockMode}
        onToggleEdit={() => setEditMode(prev => !prev)}
        onToggleAddStock={() => setAddStockMode(prev => !prev)}
        isSuperadmin={isSuperadmin}
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
              {isSuperadmin ? (
                <SignUp />
              ) : (
                <div className='text-center mt-5'>
                  <h3>Access Denied</h3>
                  <p>This page is restricted to superadmins only.</p>
                </div>
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path='/settings'
          element={
            <ProtectedRoute>
              {isSuperadmin ? (
                <Settings />
              ) : (
                <div className='text-center mt-5'>
                  <h3>Access Denied</h3>
                  <p>This page is restricted to superadmins only.</p>
                </div>
              )}
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
                  // Optional: redirect after refund
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
