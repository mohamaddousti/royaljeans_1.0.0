import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  Text,
  Spinner,
  Center,
  Alert,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton
} from '@chakra-ui/react';
import { FaSearch, FaCopy, FaDownload } from 'react-icons/fa';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          setError('خطا در دریافت محصولات');
        }
      } catch (err) {
        setError('اتصال به سرور ناموفق بود');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.product_name.includes(searchTerm) || 
    product.product_code.includes(searchTerm) ||
    product.additional_code.includes(searchTerm)
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Box>
      <Heading mb={6}>لیست محصولات</Heading>
      
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Button leftIcon={<FaDownload />} colorScheme="brand" variant="outline">
              خروجی اکسل
            </Button>
          </HStack>
        </CardBody>
      </Card>
      
      {loading ? (
        <Center p={10}>
          <Spinner size="xl" color="brand.500" />
        </Center>
      ) : error ? (
        <Alert status="error" mb={6}>
          {error}
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardBody>
            <Text textAlign="center">محصولی یافت نشد</Text>
          </CardBody>
        </Card>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ردیف</Th>
                <Th>نام محصول</Th>
                <Th>کد محصول</Th>
                <Th>کد اضافی</Th>
                <Th>تاریخ ایجاد</Th>
                <Th>عملیات</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProducts.map((product, index) => (
                <Tr key={product.id}>
                  <Td>{index + 1}</Td>
                  <Td>{product.product_name}</Td>
                  <Td>{product.product_code}</Td>
                  <Td>{product.additional_code}</Td>
                  <Td>{new Date(product.created_at).toLocaleDateString('fa-IR')}</Td>
                  <Td>
                    <IconButton
                      icon={<FaCopy />}
                      aria-label="کپی"
                      size="sm"
                      onClick={() => copyToClipboard(product.product_name)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductsPage;