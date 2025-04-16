import React from 'react';
import { Box } from '@chakra-ui/react';
import ProductGenerator from './ProductGenerator';

const GeneratePage = ({ user }) => {
  return (
    <Box p={4}>
      <ProductGenerator token={user?.token} />
    </Box>
  );
};

export default GeneratePage;