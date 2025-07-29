import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // or adjust path based on where you placed it

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()

  if (!currentUser) {
    // 🚫 If not logged in, redirect to login page
    return <Navigate to='/login' replace />
  }

  // If logged in, allow access
  return children
}

export default ProtectedRoute
