import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react'; // Import ColorModeScript
import App from './App';
import './index.css';

// Extend the theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark', // Set initial color mode to dark
    useSystemColorMode: false, // Disable system color mode preference
  },
  direction: 'rtl',
  fonts: {
    heading: 'Vazir, Arial, sans-serif',
    body: 'Vazir, Arial, sans-serif',
  },
  colors: {
    // Use cyan color scheme (adjust shades as needed)
    brand: { // You can keep 'brand' or rename it to 'cyan' or similar
      50: '#E0FFFF',
      100: '#B3FDFF',
      200: '#85F7FF',
      300: '#5AF0FF',
      400: '#38E7FF',
      500: '#1CDAFF', // Cyan main color
      600: '#00B8D9',
      700: '#0093B3',
      800: '#006D8C',
      900: '#004966',
    },
    // Ensure gray colors are suitable for dark mode if needed
    // gray: { ... }
  },
  styles: {
    global: (props) => ({ // Make global styles dependent on color mode
      body: {
        direction: 'rtl',
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white', // Adjust background for dark/light
        color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800', // Adjust text color
      },
    }),
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Add ColorModeScript for initial color mode */}
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);