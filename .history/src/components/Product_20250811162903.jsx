import React, { useState } from 'react'
import axios from 'axios'

const ProductForm = () => {
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Handle file selection and create preview
  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Upload to Cloudinary
  const handleUpload = async () => {
    if (!imageFile) {
      alert('Please select an image first')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('upload_preset', 'your_upload_preset_here') // Replace with your preset

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
        formData
      )
      console.log('Uploaded Image URL:', response.data.secure_url)
      alert('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='container mt-4'>
      <h2>Add New Product</h2>
      <form>
        <div className='mb-3'>
          <label className='form-label'>Product Name</label>
          <input
            type='text'
            className='form-control'
            value={productName}
            onChange={e => setProductName(e.target.value)}
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>Price</label>
          <input
            type='number'
            className='form-control'
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>Product Image</label>
          <input
            type='file'
            accept='image/*'
            className='form-control'
            onChange={handleImageChange}
          />
        </div>

        {/* Live image preview */}
        {imagePreview && (
          <div className='mb-3 text-center'>
            <p>Image Preview:</p>
            <img
              src={imagePreview}
              alt='Preview'
              style={{
                maxWidth: '200px',
                borderRadius: '10px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        )}

        <button
          type='button'
          className='btn btn-primary'
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </div>
  )
}

export default ProductForm
