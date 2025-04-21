import React, { useState } from 'react';
import {
  Box,
  VStack,
  Button,
  useColorModeValue,
  Icon,
  Flex,
  Text,
  Tooltip,
  Divider,
  Avatar
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiPlus, 
  FiList, 
  FiUser, 
  FiSettings,
  FiLogOut
} from 'react-icons/fi';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');

  // Navigation items
  const navItems = [
    { name: 'صفحه اصلی', icon: FiHome, path: '/' },
    { name: 'تولید محصول', icon: FiPlus, path: '/generate' },
    { name: 'لیست محصولات', icon: FiList, path: '/products' },
    { name: 'پروفایل', icon: FiUser, path: '/profile' },
    { name: 'مدیریت', icon: FiSettings, path: '/admin' },
  ];

  // Check if a route is active
  const isActive = (path) => location.pathname === path;

  // Get full name from user object
  const getFullName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user?.first_name) {
      return user.first_name;
    } else if (user?.last_name) {
      return user.last_name;
    }
    return 'کاربر';
  };

  return (
    <Box
      h="100%"
      bg={bgColor}
      py={4}
      px={2}
      overflow="hidden"
      transition="width 0.3s ease, min-width 0.3s ease"
      borderRight="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="relative"
      minW={isHovered ? "200px" : "80px"}
      w={isHovered ? "200px" : "80px"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* User Profile Section */}
      <Flex 
        direction="column" 
        align="center" 
        mb={6} 
        px={2}
      >
        <Avatar
          size="md"
          name={getFullName()}
          src={user?.avatar}
          mb={2}
        />
        <Text 
          fontSize="sm" 
          fontWeight="medium" 
          textAlign="center"
          noOfLines={1}
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.3s ease"
          display={isHovered ? "block" : "none"}
        >
          {getFullName()}
        </Text>
      </Flex>

      <Divider mb={4} />

      {/* Navigation Links */}
      <VStack spacing={1} align="stretch">
        {navItems.map((item) => (
          <Tooltip 
            key={item.path} 
            label={item.name} 
            placement="left"
            openDelay={500}
            hasArrow
            display={{ base: 'none', md: isHovered ? 'none' : 'block' }}
          >
            <Button
              as={Link}
              to={item.path}
              variant="ghost"
              justifyContent="flex-start"
              w="full"
              h="40px"
              borderRadius="md"
              px={3}
              leftIcon={
                <Icon 
                  as={item.icon} 
                  boxSize={5} 
                  color={isActive(item.path) ? activeColor : iconColor}
                />
              }
              bg={isActive(item.path) ? activeBg : 'transparent'}
              color={isActive(item.path) ? activeColor : 'inherit'}
              _hover={{ bg: hoverBg }}
              mb={1}
            >
              <Text 
                opacity={isHovered ? 1 : 0}
                transition="opacity 0.3s ease"
                fontWeight={isActive(item.path) ? "bold" : "normal"}
                display={isHovered ? "block" : "none"}
              >
                {item.name}
              </Text>
            </Button>
          </Tooltip>
        ))}
      </VStack>

      {/* Logout Button at Bottom */}
      <Tooltip 
        label="خروج" 
        placement="left"
        openDelay={500}
        hasArrow
        display={{ base: 'none', md: isHovered ? 'none' : 'block' }}
      >
        <Button
          variant="ghost"
          justifyContent="flex-start"
          w="full"
          h="40px"
          borderRadius="md"
          px={3}
          leftIcon={
            <Icon 
              as={FiLogOut} 
              boxSize={5} 
              color="red.500"
            />
          }
          _hover={{ bg: hoverBg }}
          position="absolute"
          bottom={4}
          left={2}
          right={2}
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        >
          <Text 
            opacity={isHovered ? 1 : 0}
            transition="opacity 0.3s ease"
            color="red.500"
            display={isHovered ? "block" : "none"}
          >
            خروج
          </Text>
        </Button>
      </Tooltip>
    </Box>
  );
};

export default Sidebar;
