// src/pages/ResetPassword.jsx
import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useNavigate } from 'react-router-dom'

const ResetPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleReset = async e => {
    e.preventDefault()
    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Password reset email sent! Check your inbox.')
      setTimeout(() => navigate('/'), 3000) // Redirect after 3 secs
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className='container mt-5'>
      <h3>Reset Password</h3>
      <form onSubmit={handleReset}>
        <div className='mb-3'>
          <label className='form-label'>Enter your email address</label>
          <input
            type='email'
            className='form-control'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <button type='submit' className='btn btn-primary'>
          Send Reset Link
        </button>
      </form>
      {message && <p className='mt-3 text-info'>{message}</p>}
    </div>
  )
}

export default ResetPassword
