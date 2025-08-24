// src/App.jsx
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase/config'

import Login from './pages/Login'
import CreateAccount from './components/CreateAccount'
import Settings from './pages/settings'
import ResetPassword from './pages/ResetPassword'

import SuperAdminOrders from './components/SuperAdminOrders'
import Order from './components/Order' // <-- Import Orders component here
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Product from './components/Product'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import RefundMode from './components/RefundMode'
import ProtectedRoute from './routes/ProtectedRoute'
import PrivateRouteForSuperAdmin from './components/PrivateRouteForSuperAdmin'

import { LanguageProvider } from './context/LanguageContext' // <-- added

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
    // Wrap whole app in LanguageProvider so any component can use the toggle
    <LanguageProvider>
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
            path='/create-account'
            element={
              <PrivateRouteForSuperAdmin>
                <CreateAccount />
              </PrivateRouteForSuperAdmin>
            }
          />
          <Route
            path='/settings'
            element={
              <PrivateRouteForSuperAdmin>
                <Settings />
              </PrivateRouteForSuperAdmin>
            }
          />
          ;<Route path='/suppliers' element={} />

          <Route
            path='/suppliers'
            element={
              <PrivateRouteForSuperAdmin>
                <Settings />
              </PrivateRouteForSuperAdmin>
            }
          />
          <Route
            path='/superadmin-orders'
            element={
              <PrivateRouteForSuperAdmin>
                <SuperAdminOrders />
              </PrivateRouteForSuperAdmin>
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
            path='/order' // <-- Added this route
            element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            }
          />
          <Route
            path='/refund'
            element={
              <PrivateRouteForSuperAdmin>
                <RefundMode />
              </PrivateRouteForSuperAdmin>
            }
          />

          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
