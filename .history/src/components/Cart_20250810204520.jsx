const handleCheckout = async () => {
  try {
    const user = auth.currentUser
    if (!user) {
      alert('You must be logged in to checkout.')
      return
    }

    const formattedItems = cartItems.map(item => ({
      productId: item.productId || '',
      barcode: item.barcode || 'N/A',
      productName: item.productName || 'Unnamed Product',
      qty: Number(item.quantity || item.qty) || 0,
      price: Number(item.price) || 0
    }))

    const orderData = {
      userId: user.uid,
      userEmail: user.email,
      companyName: companyName || 'N/A',
      date: Timestamp.now(),
      items: formattedItems,
      total: subtotal
    }

    let docRef
    if (role === 'company') {
      docRef = await addDoc(collection(db, 'orders'), orderData)
      alert('Order placed successfully.')
      clearCart() // orders clear immediately
    } else if (role === 'staff' || role === 'superadmin') {
      docRef = await addDoc(collection(db, 'receipts'), orderData)
      alert('Receipt generated successfully.')
      setReceiptId(docRef.id)
      // Pass snapshot of items to avoid empty array after clear
      setShowReceipt({ items: formattedItems, total: subtotal })
    } else {
      alert('Unknown role. Cannot process.')
      return
    }
  } catch (err) {
    console.error('Checkout error:', err)
    alert('Failed to process.')
  }
}
