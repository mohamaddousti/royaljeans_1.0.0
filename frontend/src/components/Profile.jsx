import React, { useState } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = ({ user }) => {
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    password: '',
    avatar: null
  });
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    if (formData.password) data.append('password', formData.password);
    if (formData.avatar) data.append('avatar', formData.avatar);

    try {
      await axios.post('http://localhost:8000/update_profile', data);
      alert('پروفایل به‌روزرسانی شد');
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto">
        <h2 className="text-neon text-center mb-4">پروفایل</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleUpdate}>
          <div className="text-center mb-3">
            <img
              src={user?.avatar || '/static/images/default-avatar.png'}
              alt="Avatar"
              className="avatar"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">نام</label>
            <input
              type="text"
              className="form-control"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">نام خانوادگی</label>
            <input
              type="text"
              className="form-control"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">رمز عبور جدید (اختیاری)</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">آواتار</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFormData({ ...formData, avatar: e.target.files[0] })}
            />
          </div>
          <button type="submit" className="btn-neon w-100">به‌روزرسانی</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;