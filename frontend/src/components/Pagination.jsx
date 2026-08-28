import { useState } from 'react'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const [inputValue, setInputValue] = useState(String(currentPage))

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue)
    if (!parsed || parsed < 1 || parsed > totalPages) {
      onPageChange(1)
      setInputValue('1')
    } else {
      onPageChange(parsed)
      setInputValue(String(parsed))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  // sync input khi currentPage thay đổi từ bên ngoài
  if (String(currentPage) !== inputValue && document.activeElement?.tagName !== 'INPUT') {
    setInputValue(String(currentPage))
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
        }`}
      >
        Trước
      </button>

      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-8 text-center text-sm font-bold text-blue-600 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-gray-400 text-sm">/</span>
        <span className="text-sm font-medium text-gray-600">{totalPages}</span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
        }`}
      >
        Sau
      </button>
    </div>
  )
}