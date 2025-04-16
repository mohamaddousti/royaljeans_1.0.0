import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>
      <div className="sidebar-content">
        <div className="user-info">
          <img src={user?.avatar || '/static/images/default-avatar.png'} alt="Avatar" className="avatar" />
          <div>
            <span>{user?.first_name} {user?.last_name}</span>
            <span className="username">{user?.username}</span>
            <span className={`status ${user?.status === 'online' ? 'online' : user?.status === 'away' ? 'away' : ''}`}></span>
          </div>
        </div>
        <ul className="nav-list">
          <li><a onClick={() => navigate('/')}>خانه</a></li>
          <li><a onClick={() => navigate('/profile')}>پروفایل</a></li>
          {user?.permissions.includes('generate') && (
            <li><a onClick={() => navigate('/generate')}>تولید محصول</a></li>
          )}
          {user?.permissions.includes('admin') && (
            <li><a onClick={() => navigate('/admin')}>مدیریت</a></li>
          )}
          <li><a onClick={() => navigate('/login')}>خروج</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;