import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react'; // Import ColorModeScript
import App from './App';
import './index.css';
import theme from './theme' // Import the theme

// Extend the theme
const myNewTheme = extendTheme(theme)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Add ColorModeScript for initial color mode */}
    <ColorModeScript initialColorMode={myNewTheme.config.initialColorMode} />
    <ChakraProvider theme={myNewTheme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);