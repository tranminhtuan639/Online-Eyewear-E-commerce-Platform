import { useEffect, useState } from 'react'

import { listSanPham } from '../api/sanPham'

import ProductCard from './ProductCard'


// Tối đa 8 sản phẩm, lưới 4 cột x 2 hàng (dùng chung class .products-grid với mục "SẢN PHẨM")
const SO_LUONG_TOI_DA = 8


export default function FavoriteProductsSection() {

  const [products, setProducts] =
    useState([])

  const [loading, setLoading] =
    useState(true)


  /* =======================================================
     LOAD - luôn lấy top 8 sản phẩm nhiều lượt yêu thích nhất,
  ======================================================= */

  useEffect(() => {

  let huy = false

  setLoading(true)

  listSanPham({
    limit: SO_LUONG_TOI_DA,
    sap_xep: 'yeu_thich',
  })

    .then(res => {

      if (huy) return

      const items =
        res.data?.data?.items || []

      setProducts(items)

    })

    .catch(error => {

      if (huy) return

      console.error(
        'Lỗi tải sản phẩm yêu thích nhất:',
        error
      )

      setProducts([])

    })

    .finally(() => {

      if (!huy) setLoading(false)

    })

  return () => {
    huy = true
  }

}, [])


  return (
    <section className="favorite-section section-frame">

      <div className="section-heading">

        <div>

          <span className="section-eyebrow">
            SẢN PHẨM NỔI BẬT
          </span>

          <h2>
            Top 8 sản phẩm được yêu thích nhất
          </h2>

        </div>

      </div>

      {/* GRID */}

      {loading ? (

        <div className="loading-state">
          Đang tải sản phẩm...
        </div>

      ) : products.length === 0 ? (

        <div className="empty-state">
          Chưa có sản phẩm nào được yêu thích.
        </div>

      ) : (

        <div className="products-grid">

          {products.map(
            product => (

              <ProductCard
                key={product.id}
                product={product}
              />

            )
          )}

        </div>

      )}

    </section>
  )
}
