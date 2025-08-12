import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // adjust path if different
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Settings () {
  const { currentUser } = useAuth() // Assuming your auth context provides this

  // Example: Assuming 'role' field in user profile determines super admin
  const isSuperAdmin = currentUser?.role === 'superadmin'

  return (
    <div className='container py-5'>
      <h2 className='mb-4 text-center'>⚙️ Settings</h2>

      {/* Regular Settings */}
      <div className='list-group shadow'>
        <Link to='/profile' className='list-group-item list-group-item-action'>
          Profile Settings
        </Link>
        <Link
          to='/change-password'
          className='list-group-item list-group-item-action'
        >
          Change Password
        </Link>
        <Link
          to='/notifications'
          className='list-group-item list-group-item-action'
        >
          Notification Settings
        </Link>
      </div>

      {/* Super Admin Exclusive Section */}
      {isSuperAdmin && (
        <div className='mt-5'>
          <h4 className='text-primary mb-3'>Super Admin Panel</h4>
          <div className='list-group shadow'>
            <Link
              to='/superadmin-orders'
              className='list-group-item list-group-item-action list-group-item-warning fw-bold'
            >
              📦 View All Orders
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
