import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductList.css';

const ProductList = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  console.log('ProductList component mounted, token:', token);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products with token:', token);
        if (!token) {
          setError('لطفاً دوباره وارد شوید');
          return;
        }
        const response = await axios.get('http://127.0.0.1:8000/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API response:', response.data);
        setProducts(response.data);
      } catch (err) {
        console.log('API error:', err.message);
        setError(err.response?.data?.detail || 'خطا در دریافت محصولات');
      }
    };
    fetchProducts();
  }, [token]);

  console.log('Current state - products:', products, 'error:', error);

  if (error) {
    return <div>خطا: {error}</div>;
  }
  if (products === null || products === undefined) {
    return <div>در حال بارگذاری...</div>;
  }
  if (!products.length) {
    return <div>محصولی یافت نشد</div>;
  }

  return (
    <div className="product-list-container">
      <h2>لیست محصولات</h2>
      <table>
        <thead>
          <tr>
            <th>نام محصول</th>
            <th>کد محصول</th>
            <th>کد اضافی</th>
            <th>تاریخ ایجاد</th>
            <th>ایجاد شده توسط</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.product_name}</td>
              <td>{product.product_code}</td>
              <td>{product.additional_code}</td>
              <td>{new Date(product.created_at).toLocaleString('fa-IR')}</td>
              <td>{product.created_by || 'نامشخص'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;