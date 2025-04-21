import React, { useState } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  IconButton,
  HStack,
  useMediaQuery,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Container,
  VStack
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

const LayoutComponent = ({ children, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex 
      direction="column" 
      minH="100vh" 
      bg={bgColor} 
      color={textColor}
      fontFamily="Vazirmatn, sans-serif"
    >
      {/* Navbar - Fixed at top */}
      <Navbar 
        user={user} 
        onMenuClick={onOpen}
        isMobile={isMobile}
      />
      
      {/* Main Content Area */}
      <Flex 
        flex="1" 
        direction="row" 
        pt={{ base: 2, md: 4 }} 
        px={{ base: 0, md: 4 }}
      >
        {/* Sidebar - Responsive handling */}
        {isMobile ? (
          <Drawer 
            placement="right" 
            onClose={onClose} 
            isOpen={isOpen}
            size="xs"
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerBody p={0}>
                <Sidebar user={user} isExpanded={true} />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ) : (
          <Box 
            w="80px" 
            flexShrink={0} 
            transition="width 0.3s ease"
            _hover={{ w: "250px" }}
            h="calc(100vh - 60px)"
            position="sticky"
            top="60px"
            overflowY="auto"
            className="sidebar-container"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: borderColor,
                borderRadius: '24px',
              },
            }}
          >
            <Sidebar user={user} />
          </Box>
        )}

        {/* Main Content */}
        <Box 
          flex="1" 
          p={{ base: 2, md: 4 }}
          ml={{ base: 0, md: 2 }}
          overflowX="hidden"
        >
          <Container 
            maxW={{ base: "100%", lg: "1200px" }} 
            px={{ base: 2, md: 4 }}
            py={4}
          >
            {children}
          </Container>
        </Box>
      </Flex>

      {/* Footer */}
      <Footer />
    </Flex>
  );
};

export default LayoutComponent;
