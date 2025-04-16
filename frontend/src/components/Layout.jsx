import React from 'react';
import { Box, Flex, Text, Avatar, Heading, VStack, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaList, FaUser, FaCog } from 'react-icons/fa';

const menuItems = [
  { key: '/', icon: FaHome, label: 'داشبورد', path: '/' },
  { key: '/generate', icon: FaPlus, label: 'تولید محصول', path: '/generate' },
  { key: '/products', icon: FaList, label: 'لیست محصولات', path: '/products' },
  { key: '/profile', icon: FaUser, label: 'پروفایل', path: '/profile' },
  { key: '/admin', icon: FaCog, label: 'ادمین', path: '/admin' },
];

const LayoutComponent = ({ user, children }) => {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Flex h="100vh" direction="row-reverse">
      {/* Sidebar */}
      <Box
        w="220px"
        bg={bgColor}
        borderLeft="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Box h="64px" display="flex" alignItems="center" justifyContent="center" fontWeight="bold" fontSize="xl" borderBottom="1px solid" borderColor={borderColor}>
          <Text>Royal Jeans</Text>
        </Box>
        <VStack align="stretch" spacing={0}>
          {menuItems.map((item) => (
            <Link to={item.path} key={item.key}>
              <Box
                py={3}
                px={4}
                bg={location.pathname === item.path ? 'brand.50' : 'transparent'}
                color={location.pathname === item.path ? 'brand.500' : 'inherit'}
                fontWeight={location.pathname === item.path ? 'bold' : 'normal'}
                _hover={{ bg: 'gray.50' }}
                transition="all 0.2s"
              >
                <HStack spacing={3}>
                  <Icon as={item.icon} />
                  <Text>{item.label}</Text>
                </HStack>
              </Box>
            </Link>
          ))}
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex="1" display="flex" flexDirection="column">
        {/* Header */}
        <Flex
          h="64px"
          px={6}
          alignItems="center"
          justifyContent="space-between"
          borderBottom="1px solid"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Heading size="md">
            {menuItems.find(item => item.path === location.pathname)?.label || 'صفحه'}
          </Heading>
          <HStack spacing={3}>
            <Avatar size="sm" name={user?.first_name || 'کاربر'} />
            <Text fontWeight="bold">{user?.first_name || 'کاربر'}</Text>
          </HStack>
        </Flex>
        
        {/* Page Content */}
        <Box flex="1" p={6} bg="gray.50" overflowY="auto">
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default LayoutComponent;