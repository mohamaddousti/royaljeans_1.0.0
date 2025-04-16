import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="hero-section">
        <h1 className="text-neon">خوش آمدید، {user.first_name} {user.last_name}!</h1>
        <p className="lead">با Royal Jeans استایلت رو به سطح بعدی ببر.</p>
        <button className="btn-neon" onClick={() => navigate('/generate')}>
          شروع تولید
        </button>
      </div>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card">
              <h3 className="text-neon">پروفایل</h3>
              <p>اطلاعات کاربری خودت رو مدیریت کن.</p>
              <button className="btn-neon" onClick={() => navigate('/profile')}>
                مشاهده
              </button>
            </div>
          </div>
          {user.permissions.includes('admin') && (
            <div className="col-md-4">
              <div className="card">
                <h3 className="text-neon">مدیریت کاربران</h3>
                <p>کاربران سیستم رو کنترل کن.</p>
                <button className="btn-neon" onClick={() => navigate('/admin')}>
                  مدیریت
                </button>
              </div>
            </div>
          )}
          {user.permissions.includes('generate') && (
            <div className="col-md-4">
              <div className="card">
                <h3 className="text-neon">تولید</h3>
                <p>محصولات جدید اضافه کن.</p>
                <button className="btn-neon" onClick={() => navigate('/generate')}>
                  تولید
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;