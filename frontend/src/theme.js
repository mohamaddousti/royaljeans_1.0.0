import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Vazirmatn, sans-serif',
    fontWeightBold: 700, // Ensure this is defined
  },
  palette: {
    primary: {
      main: '#00B5D8', // Cyan color
    },
  },
});

export default theme;