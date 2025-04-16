import React, { useState } from 'react';
import axios from 'axios';
import './Generate.css';

const Generate = ({ user }) => {
  const [code, setCode] = useState('');
  const [additionalCode, setAdditionalCode] = useState('');
  const [productName, setProductName] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/generate_product', {
        code,
        additional_code: additionalCode
      });
      setProductName(response.data.product_name);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
      setProductName('');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto">
        <h2 className="text-neon text-center mb-4">تولید محصول</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {productName && <div className="alert alert-success">{productName}</div>}
        <form onSubmit={handleGenerate}>
          <div className="mb-3">
            <label className="form-label">کد 29 رقمی</label>
            <input
              type="text"
              className="form-control"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: 10460010900010000510903164531"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">کد اضافی (5-10 رقم)</label>
            <input
              type="text"
              className="form-control"
              value={additionalCode}
              onChange={(e) => setAdditionalCode(e.target.value)}
              placeholder="مثال: 12345678"
            />
          </div>
          <button type="submit" className="btn-neon w-100">تولید</button>
        </form>
      </div>
    </div>
  );
};

export default Generate;