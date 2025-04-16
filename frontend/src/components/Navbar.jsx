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
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

const Navbar = ({ user }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.400');

  return (
    <Flex
      bg={bgColor}
      color={textColor}
      align="center"
      px={4}
      py={2}
      shadow="md"
      minH="60px"
    >
      <Heading size="lg">Royal Jeans</Heading>
      <Spacer />
      <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
        <Button as={Link} to="/" variant="ghost">صفحه اصلی</Button>
        <Button as={Link} to="/generate" variant="ghost">تولید محصول</Button>
        <Button as={Link} to="/products" variant="ghost">لیست محصولات</Button>
        <Button as={Link} to="/profile" variant="ghost">پروفایل</Button>
        <Button as={Link} to="/admin" variant="ghost">مدیریت</Button>
      </HStack>
      {user && (
        <HStack spacing={2}>
          <Text>{user.username}</Text>
          {/* Add avatar here */}
        </HStack>
      )}
    </Flex>
  );
};

export default Navbar;