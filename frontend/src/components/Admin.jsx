import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = ({ user }) => {
  const [newCode, setNewCode] = useState({
    category: '', category_code: '',
    material: '', material_code: '',
    model: '', model_code: '',
    style1: '', style1_code: '',
    style2: '', style2_code: '',
    style3: '', style3_code: '',
    style4: '', style4_code: '',
    weight: '', weight_code: '',
    length: '', length_code: '',
    color: '', color_code: '',
    fabric: '', fabric_code: '',
    size: '', size_code: ''
  });
  const [logs, setLogs] = useState([]);
  const [newUser, setNewUser] = useState({
    first_name: '', last_name: '', username: '', password: '', permissions: []
  });
  const [error, setError] = useState('');

  const handleAddCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/add_product_code', newCode);
      alert('مقدار جدید اضافه شد');
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
    }
  };

  const handleExport = async () => {
    try {
      await axios.get('http://localhost:8000/export_db');
      alert('فایل اکسل ذخیره شد');
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/product_logs');
      setLogs(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/create_user', newUser);
      alert('کاربر جدید ایجاد شد');
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-neon mb-4">پنل مدیریت</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-4 mb-4">
        <h3>اضافه کردن مقدار جدید</h3>
        <form onSubmit={handleAddCode}>
          <div className="row">
            {Object.keys(newCode).map((key) => (
              <div className="col-md-3 mb-3" key={key}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={key}
                  value={newCode[key]}
                  onChange={(e) => setNewCode({ ...newCode, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn-neon">اضافه کردن</button>
        </form>
      </div>

      <div className="card p-4 mb-4">
        <h3>ایجاد کاربر جدید</h3>
        <form onSubmit={handleCreateUser}>
          <div className="row">
            <div className="col-md-3 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="نام"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
              />
            </div>
            <div className="col-md-3 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="نام خانوادگی"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
              />
            </div>
            <div className="col-md-3 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="نام کاربری"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div className="col-md-3 mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="رمز عبور"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="col-md-12 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="پرمیشن‌ها (با کاما جدا کنید)"
                onChange={(e) => setNewUser({ ...newUser, permissions: e.target.value.split(',') })}
              />
            </div>
          </div>
          <button type="submit" className="btn-neon">ایجاد کاربر</button>
        </form>
      </div>

      <div className="card p-4 mb-4">
        <h3>گزارش محصولات</h3>
        <button className="btn-neon mb-3" onClick={handleExport}>خروجی اکسل</button>
        <table className="table table-dark">
          <thead>
            <tr>
              <th>کاربر</th>
              <th>نام محصول</th>
              <th>زمان</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.user}</td>
                <td>{log.product_name}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;