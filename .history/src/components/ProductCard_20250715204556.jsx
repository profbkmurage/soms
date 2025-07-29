import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import AddStockModal from './AddStockModal'

const ProductCard = ({ product, editMode, addStockMode, refreshProducts }) => {
  const [storeQty, setStoreQty] = useState(product.storeQty)
  const [shopQty, setShopQty] = useState(product.shopQty)
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const totalQty = storeQty + shopQty
  const originalTotal = product.totalQty
  const variance = totalQty - originalTotal

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const productRef = doc(db, 'products', product.id)
      await updateDoc(productRef, {
        storeQty,
        shopQty,
        totalQty,
        lastUpdated: new Date()
      })
      alert('Product stock updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product stock.')
    }
    setIsSaving(false)
  }

  return (
  )
}

export default ProductCard
