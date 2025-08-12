const ProductCard = ({
  product,
  editMode,
  addStockMode,
  refreshProducts,
  role
}) => {
  // ... same useState setup ...

  const totalQty = storeQty + shopQty
  const originalTotal = product.totalQty || 0
  const variance = totalQty - originalTotal

  const handleSave = async () => {
    /* same as before */
  }
  const handleAdd = () => {
    /* same as before */
  }

  const isCompanyUser = role === 'company'

  return (
    <div className='col-md-6 col-lg-4 mb-4'>
      <div className='card h-100 shadow-sm'>
        <img
          src={product.imageUrl}
          className='card-img-top'
          alt={product.productName}
          style={{ height: '200px', objectFit: 'cover' }}
        />

        <div className='card-body d-flex flex-column'>
          <h5 className='card-title text-capitalize'>{product.productName}</h5>

          <p className='mb-1'>
            <strong>Price:</strong> KES {product.price}
          </p>

          {!isCompanyUser && (
            <p className='mb-1'>
              <strong>Buying Price:</strong> KES {product.buyingPrice || 'N/A'}
            </p>
          )}

          {!isCompanyUser && (
            <p className='mb-1 text-muted'>
              <strong>Barcode:</strong> {product.barcode || 'N/A'}
            </p>
          )}

          {editMode ? (
            <>
              {/* Stock edit fields only for non-company */}
              <div className='mb-2'>
                <label className='form-label'>Store Quantity</label>
                <input
                  type='number'
                  className='form-control'
                  value={storeQty === 0 ? '' : storeQty}
                  onChange={e =>
                    setStoreQty(
                      e.target.value === ''
                        ? 0
                        : Math.max(0, parseInt(e.target.value))
                    )
                  }
                />
              </div>
              <div className='mb-2'>
                <label className='form-label'>Shop Quantity</label>
                <input
                  type='number'
                  className='form-control'
                  value={shopQty === 0 ? '' : shopQty}
                  onChange={e =>
                    setShopQty(
                      e.target.value === ''
                        ? 0
                        : Math.max(0, parseInt(e.target.value))
                    )
                  }
                />
              </div>
              <div className='mb-2'>
                <label className='form-label'>Expiry Date</label>
                <input
                  type='date'
                  className='form-control'
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                />
              </div>
              <p className='mb-1'>
                <strong>Total:</strong> {totalQty}
              </p>
              <p className='mb-3'>
                <strong>Variance:</strong>
                <span
                  className={`badge ${
                    variance === 0 ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  {variance}
                </span>
              </p>
              <button
                className='btn btn-primary mt-auto w-100'
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <p className='mb-1'>
                <strong>Total:</strong>{' '}
                <span className='badge bg-secondary'>{totalQty}</span>
              </p>
              {!isCompanyUser && (
                <>
                  <p className='mb-1'>
                    <strong>Store:</strong> {storeQty}
                  </p>
                  <p className='mb-1'>
                    <strong>Shop:</strong> {shopQty}
                  </p>
                  {product.expiryDate && (
                    <p className='mb-2 text-muted'>
                      <strong>Expiry:</strong>{' '}
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}
              <input
                type='number'
                className='form-control mb-2'
                value={qty}
                onChange={e => setQty(e.target.value)}
                min='1'
              />
              <button
                className='btn btn-outline-success w-100'
                onClick={handleAdd}
              >
                Add to Cart
              </button>
            </>
          )}
        </div>

        {!isCompanyUser && addStockMode && (
          <div className='card-footer bg-transparent border-0'>
            <button
              className='btn btn-outline-primary w-100'
              onClick={() => setShowModal(true)}
            >
              Add Stock
            </button>
          </div>
        )}
      </div>

      {!isCompanyUser && (
        <AddStockModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          product={product}
          refreshProducts={refreshProducts}
        />
      )}
    </div>
  )
}
