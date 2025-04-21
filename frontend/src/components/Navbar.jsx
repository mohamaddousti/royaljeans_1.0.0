import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  Spacer,
  useColorModeValue,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useColorMode,
  Tooltip,
  Container
} from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = ({ user, onMenuClick, isMobile }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Check if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <Box 
      bg={bgColor} 
      color={textColor} 
      py={2} 
      px={4} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      shadow="sm"
    >
      <Container maxW="1200px">
        <Flex align="center" justify="space-between">
          {/* Logo/Brand */}
          <Heading 
            size={{ base: "md", md: "lg" }} 
            fontFamily="Vazirmatn, sans-serif"
            fontWeight="bold"
          >
            Royal Jeans
          </Heading>

          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Button 
              as={Link} 
              to="/" 
              variant={isActive('/') ? "solid" : "ghost"}
              colorScheme={isActive('/') ? "blue" : "gray"}
              size="sm"
            >
              صفحه اصلی
            </Button>
            <Button 
              as={Link} 
              to="/generate" 
              variant={isActive('/generate') ? "solid" : "ghost"}
              colorScheme={isActive('/generate') ? "blue" : "gray"}
              size="sm"
            >
              تولید محصول
            </Button>
            <Button 
              as={Link} 
              to="/products" 
              variant={isActive('/products') ? "solid" : "ghost"}
              colorScheme={isActive('/products') ? "blue" : "gray"}
              size="sm"
            >
              لیست محصولات
            </Button>
            <Button 
              as={Link} 
              to="/admin" 
              variant={isActive('/admin') ? "solid" : "ghost"}
              colorScheme={isActive('/admin') ? "blue" : "gray"}
              size="sm"
            >
              مدیریت
            </Button>
          </HStack>

          {/* Right Side - User Menu & Theme Toggle */}
          <HStack spacing={2}>
            {/* Theme Toggle */}
            <Tooltip label={colorMode === 'light' ? 'حالت تاریک' : 'حالت روشن'}>
              <IconButton
                aria-label="Toggle theme"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                size="sm"
                variant="ghost"
              />
            </Tooltip>

            {/* User Menu */}
            {user && (
              <Menu>
                <MenuButton>
                  <Avatar 
                    size="sm" 
                    name={`${user.first_name} ${user.last_name}`} 
                    src={user.avatar}
                    cursor="pointer"
                  />
                </MenuButton>
                <MenuList zIndex={1500}>
                  <MenuItem 
                    as={Link} 
                    to="/profile" 
                    icon={<FiUser />}
                  >
                    پروفایل
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout} 
                    icon={<FiLogOut />}
                    color="red.500"
                  >
                    خروج
                  </MenuItem>
                </MenuList>
              </Menu>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                onClick={onMenuClick}
                variant="ghost"
                display={{ base: 'flex', md: 'none' }}
              />
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;