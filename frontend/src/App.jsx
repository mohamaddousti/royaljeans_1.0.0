import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import Chakra UI components
import { Box, Spinner, Text, Center, useColorModeValue } from '@chakra-ui/react';
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
  const [loading, setLoading] = useState(!!token); // Keep loading state logic

  // Fetch user data logic remains the same
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error('Failed to fetch user data, status:', response.status);
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

    fetchUserData();
  }, [token]);

  // Use color mode value for potential styling adjustments
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  return (
    <Router>
      {/* CssBaseline is removed */}
      {loading ? (
        // Replace MUI Box and CircularProgress with Chakra Center and Spinner
        <Center h="100vh" bg={bgColor}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.500" // Use brand color
            size="xl"
          />
          {/* Replace MUI Typography with Chakra Text */}
          <Text fontSize="xl" ml={4} color={textColor}>در حال بارگذاری...</Text>
        </Center>
      ) : !token ? (
        <Login setToken={setToken} />
      ) : !user ? ( // Optional: Add a specific loading state for user fetching if desired
          <Center h="100vh" bg={bgColor}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.500"
              size="xl"
            />
            <Text fontSize="xl" ml={4} color={textColor}>در حال دریافت اطلاعات کاربر...</Text>
          </Center>
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