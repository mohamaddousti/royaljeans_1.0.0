import React, { useState } from 'react';
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Alert,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Heading,
  IconButton,
  Flex
} from '@chakra-ui/react';
import { FaCopy } from 'react-icons/fa';

function ProductGenerator({ token }) {
  const [code, setCode] = useState('');
  const [additionalCode, setAdditionalCode] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  const handleGenerate = async (e) => {
    e.preventDefault();
    console.log('Generating product with token:', token);
    try {
      // Create FormData for the request
      const formData = new FormData();
      formData.append('code', code);
      formData.append('additional_code', additionalCode);

      const response = await fetch('http://127.0.0.1:8000/generate_product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      console.log('Generate response:', response.status);
      const data = await response.json();
      if (response.ok) {
        setResult(data.product_name);
        setError('');
        
        // Copy to clipboard automatically
        copyToClipboard(data.product_name);
      } else {
        setError(data.detail || 'خطا در تولید محصول');
      }
    } catch (err) {
      setError('اتصال به سرور ناموفق بود');
      console.log('Generate error:', err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: 'کپی شد!',
          description: `کالا با نام: ${text} کپی شد.`,
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: 'خطا',
          description: 'خطا در کپی کردن متن',
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
      });
  };

  const handleManualCopy = () => {
    if (result) {
      copyToClipboard(result);
    }
  };

  return (
    <Box maxW="container.md" mx="auto">
      <Card shadow="md" borderRadius="lg">
        <CardHeader>
          <Heading size="lg" textAlign="center">تولید محصول</Heading>
        </CardHeader>
        <CardBody>
          <VStack as="form" onSubmit={handleGenerate} spacing={4}>
            <FormControl isRequired>
              <FormLabel>کد 29 رقمی</FormLabel>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: 10460010900010000510903164531"
                dir="ltr"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>کد اضافی</FormLabel>
              <Input
                value={additionalCode}
                onChange={(e) => setAdditionalCode(e.target.value)}
                placeholder="مثال: 12345"
                dir="ltr"
              />
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="brand" 
              width="full"
              mt={4}
            >
              تولید
            </Button>
            
            {result && (
              <Alert status="success" borderRadius="md">
                <Box flex="1">
                  <Text fontWeight="bold">محصول:</Text>
                  <Text>{result}</Text>
                </Box>
                <IconButton
                  icon={<FaCopy />}
                  aria-label="کپی"
                  size="sm"
                  onClick={handleManualCopy}
                  variant="ghost"
                />
              </Alert>
            )}
            
            {error && (
              <Alert status="error" borderRadius="md">
                <Text>{error}</Text>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}

export default ProductGenerator;