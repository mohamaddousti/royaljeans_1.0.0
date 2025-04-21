import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Box,
  Spinner,
  Text,
  Center,
  useColorModeValue,
  ChakraProvider,
  extendTheme,
} from '@chakra-ui/react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';
import LayoutComponent from './components/Layout';
import GeneratePage from './components/GeneratePage';
import ProductsPage from './components/ProductsPage';
import ProfilePage from './components/ProfilePage';
import Admin from './components/Admin';
import ChatBox from './components/ChatBox';
import ProductGenerator from './components/ProductGenerator.jsx';

// Define custom theme
const theme = extendTheme({
  direction: 'rtl',
  fonts: {
    heading: 'Vazirmatn, sans-serif',
    body: 'Vazirmatn, sans-serif',
  },
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0080ff',
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'normal',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

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
            Authorization: `Bearer ${token}`,
          },
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

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  return (
    <ChakraProvider theme={theme}>
      <Router>
        {loading ? (
          <Center h="100vh" bg={bgColor} fontFamily="Vazirmatn, sans-serif">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.500"
              size="xl"
            />
            <Text fontSize="xl" ml={4} color={textColor}>
              در حال بارگذاری...
            </Text>
          </Center>
        ) : !token ? (
          <Login setToken={setToken} />
        ) : !user ? (
          <Center h="100vh" bg={bgColor} fontFamily="Vazirmatn, sans-serif">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.500"
              size="xl"
            />
            <Text fontSize="xl" ml={4} color={textColor}>
              در حال دریافت اطلاعات کاربر...
            </Text>
          </Center>
        ) : (
          <LayoutComponent user={user}>
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/generate" element={<ProductGenerator user={user} />} />
              <Route path="/products" element={<ProductsPage user={user} />} />
              <Route path="/profile" element={<ProfilePage user={user} />} />
              <Route path="/admin" element={<Admin user={user} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <ChatBox user={user} bg={bgColor} color={textColor} />
          </LayoutComponent>
        )}
      </Router>
    </ChakraProvider>
  );
}

export default App;