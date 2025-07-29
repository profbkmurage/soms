import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProductList from './component/ProductList'
import Cart from './components/Cart'

const App = () => {
  const [editMode, setEditMode] = useState(false)
  const [addStockMode, setAddStockMode] = useState(false)

  return (
    <Router>
      <Navbar
        editMode={editMode}
        addStockMode={addStockMode}
        onToggleEdit={() => setEditMode(prev => !prev)}
        onToggleAddStock={() => setAddStockMode(prev => !prev)}
      />

      <Routes>
        <Route
          path='/'
          element={
            <ProductList
              editMode={editMode}
              addStockMode={addStockMode}
              setEditMode={setEditMode}
              setAddStockMode={setAddStockMode}
            />
          }
        />
        <Route path='/cart' element={<Cart />} />
      </Routes>
    </Router>
  )
}

export default App
