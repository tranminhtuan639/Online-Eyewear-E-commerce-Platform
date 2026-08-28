import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, soLuong: item.soLuong + 1 }
            : item
        )
      }
      return [...prev, { ...product, soLuong: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateSoLuong = (productId, soLuong) => {
    if (soLuong <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, soLuong } : item)
    )
  }

  const clearCart = () => setCartItems([])

  const tongTien = cartItems.reduce((sum, item) => sum + item.gia * item.soLuong, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateSoLuong, clearCart, tongTien }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)