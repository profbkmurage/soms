import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/') // Redirect to homepage
    } catch (err) {
      setError(err
)
      alert(err)
    }
  }

  return (
    <div className='d-flex justify-content-center align-items-center min-vh-100 bg-light'>
      <div
        className='card shadow p-4'
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <h3 className='text-center mb-3 text-primary fw-bold'>
          China Garden Supermarket
        </h3>
        <h5 className='text-center mb-4'>User Login</h5>

        {error && <div className='alert alert-danger'>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='form-label'>Email address</label>
            <input
              type='email'
              className='form-control'
              placeholder='Enter email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='mb-3'>
            <label className='form-label'>Password</label>
            <input
              type='password'
              className='form-control'
              placeholder='Enter password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className='d-grid'>
            <button type='submit' className='btn btn-primary fw-bold'>
              Log In
            </button>
          </div>

          <div className='text-end mt-2'>
            <a href='/reset-password' className='text-decoration-none'>
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
