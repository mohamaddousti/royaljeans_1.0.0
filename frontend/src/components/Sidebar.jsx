import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Import the CSS file

const Sidebar = () => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.400');

  return (
    <Box
      className="sidebar" // Add the sidebar class
      bg={bgColor}
      color={textColor}
      borderRadius="md"
      p={4}
      boxShadow="sm"
      w="100%"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md" textAlign="center">
          داشبورد
        </Heading>
        <Divider />
        <Button as={Link} to="/" variant="ghost">
          صفحه اصلی
        </Button>
        <Button as={Link} to="/generate" variant="ghost">
          تولید نام محصول
        </Button>
        <Button as={Link} to="/products" variant="ghost">
          لیست محصولات
        </Button>
        <Button as={Link} to="/profile" variant="ghost">
          پروفایل
        </Button>
        <Button as={Link} to="/admin" variant="ghost">
          مدیریت
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;
