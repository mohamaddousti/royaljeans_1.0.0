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
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const LayoutComponent = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile] = useMediaQuery('(max-width: 768px)'); // Adjust breakpoint as needed

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.400');

  return (
    <Flex direction="column" minH="100vh" bg={bgColor} color={textColor}>
      {/* Navbar */}
      <Navbar user={user} />

      {/* Content */}
      <Flex flex="1" direction="row" pt={4} px={isMobile ? 2 : 4} alignItems="flex-start">
        {/* Sidebar (Hidden on smaller screens, use Drawer) */}
        {isMobile ? (
          <Drawer placement="right" onClose={handleSidebarToggle} isOpen={isSidebarOpen}>
            <DrawerOverlay>
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerBody>
                  <Sidebar />
                </DrawerBody>
              </DrawerContent>
            </DrawerOverlay>
          </Drawer>
        ) : (
          <Box w="250px" flexShrink={0} ml={4}> {/* Left margin to push content */}
            <Sidebar />
          </Box>
        )}

        {/* Main Content */}
        <Box flex="1" p={4} direction="rtl">
          {children}
        </Box>
      </Flex>

      {/* Footer */}
      <Footer />
    </Flex>
  );
};

export default LayoutComponent;