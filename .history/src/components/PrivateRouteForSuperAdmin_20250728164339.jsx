import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useSuperAdmin from '../service/useSuperAdmin'

const PrivateRouteForSuperAdmin = ({ children }) => {
  const { currentUser } = useAuth()
  const { isSuperAdmin, loading } = useSuperAdmin()

  if (loading)
    return <div className='text-center mt-5'>Checking permissions...</div>

  if (!currentUser || !isSuperAdmin) {
    return <Navigate to='/' />
  }

  return children
}

export default PrivateRouteForSuperAdmin
