import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';
import LayoutComponent from './components/Layout';
import GeneratePage from './components/GeneratePage';
import ProductsPage from './components/ProductsPage';
import ProfilePage from './components/ProfilePage';
import AdminPage from './components/AdminPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchUserData();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      // Try '/users/me' or your actual user info endpoint
      const response = await fetch('http://localhost:8000/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <CssBaseline />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
          <Typography variant="h5" sx={{ ml: 2 }}>در حال بارگذاری...</Typography>
        </Box>
      ) : !token ? (
        <Login setToken={setToken} />
      ) : !user ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
          <Typography variant="h5" sx={{ ml: 2 }}>در حال دریافت اطلاعات کاربر...</Typography>
        </Box>
      ) : (
        <LayoutComponent user={user}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </LayoutComponent>
      )}
    </Router>
  );
}

export default App;