import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  VStack,
  Container,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Text,
  Link
} from '@chakra-ui/react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.50, purple.50)',
    'linear(to-r, blue.900, purple.900)'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          // Adding this header won't solve the CORS issue, but it's good practice
          'Accept': 'application/json'
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setError('');
        navigate('/'); // Redirect to dashboard after successful login
      } else {
        setError(data.detail || 'نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message && err.message.includes('CORS')) {
        setError('خطای CORS: سرور اجازه دسترسی به درخواست‌های خارجی را نمی‌دهد. لطفاً با مدیر سیستم تماس بگیرید.');
      } else {
        setError('اتصال به سرور ناموفق بود');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bgGradient={bgGradient}
      p={8}
    >
      <Container maxW="md">
        <VStack 
          spacing={8} 
          bg={useColorModeValue('white', 'gray.800')} 
          p={8} 
          borderRadius="lg" 
          boxShadow="lg"
        >
          <Heading textAlign="center">ورود به داشبورد</Heading>
          
          {error && (
            <Alert status="error" borderRadius="md">
              {error}
            </Alert>
          )}
          
          <VStack as="form" onSubmit={handleSubmit} spacing={4} w="100%">
            <FormControl isRequired>
              <FormLabel>نام کاربری</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaUser color="gray.300" />
                </InputLeftElement>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری"
                />
              </InputGroup>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>رمز عبور</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaLock color="gray.300" />
                </InputLeftElement>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                />
              </InputGroup>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              width="full"
              mt={4}
              isLoading={loading}
            >
              ورود
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default Login;