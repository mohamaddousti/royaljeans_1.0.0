import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import './index.css';

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  direction: 'rtl',
  fonts: {
    heading: 'Vazir, Arial, sans-serif',
    body: 'Vazir, Arial, sans-serif',
  },
  colors: {
    brand: {
      50: '#e0f2ff',
      100: '#b9deff',
      200: '#90caff',
      300: '#64b5ff',
      400: '#3ba1ff',
      500: '#0087ff', // Primary color
      600: '#006ccc',
      700: '#005299',
      800: '#003766',
      900: '#001c33',
    },
  },
  styles: {
    global: {
      body: {
        direction: 'rtl',
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);