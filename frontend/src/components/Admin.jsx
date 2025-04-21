import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import './Admin.css';

const Admin = ({ user }) => {
  const [newCode, setNewCode] = useState({
    category: '', category_code: '',
    material: '', material_code: '',
    model: '', model_code: '',
    style1: '', style1_code: '',
    style2: '', style2_code: '',
    style3: '', style3_code: '',
    style4: '', style4_code: '',
    weight: '', weight_code: '',
    length: '', length_code: '',
    color: '', color_code: '',
    fabric: '', fabric_code: '',
    size: '', size_code: ''
  });
  const [logs, setLogs] = useState([]);
  const [newUser, setNewUser] = useState({
    first_name: '', last_name: '', username: '', password: '', permissions: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableBg = useColorModeValue('gray.50', 'gray.900');

  const handleAddCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/add_product_code', newCode);
      toast({
        title: 'موفقیت',
        description: 'مقدار جدید اضافه شد',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Reset form
      setNewCode({
        category: '', category_code: '',
        material: '', material_code: '',
        model: '', model_code: '',
        style1: '', style1_code: '',
        style2: '', style2_code: '',
        style3: '', style3_code: '',
        style4: '', style4_code: '',
        weight: '', weight_code: '',
        length: '', length_code: '',
        color: '', color_code: '',
        fabric: '', fabric_code: '',
        size: '', size_code: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
      toast({
        title: 'خطا',
        description: err.response?.data?.detail || 'خطایی رخ داد',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await axios.get('http://localhost:8000/export_db');
      toast({
        title: 'موفقیت',
        description: 'فایل اکسل ذخیره شد',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
      toast({
        title: 'خطا',
        description: err.response?.data?.detail || 'خطایی رخ داد',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/product_logs');
      setLogs(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
      toast({
        title: 'خطا',
        description: err.response?.data?.detail || 'خطایی رخ داد',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/create_user', newUser);
      toast({
        title: 'موفقیت',
        description: 'کاربر جدید ایجاد شد',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Reset form
      setNewUser({
        first_name: '', last_name: '', username: '', password: '', permissions: []
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'خطایی رخ داد');
      toast({
        title: 'خطا',
        description: err.response?.data?.detail || 'خطایی رخ داد',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Box>
      <Heading mb={6} textAlign="center">پنل مدیریت</Heading>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
          <Tab>کدهای محصول</Tab>
          <Tab>کاربران</Tab>
          <Tab>گزارش‌ها</Tab>
        </TabList>

        <TabPanels>
          {/* Product Codes Tab */}
          <TabPanel>
            <Card bg={cardBg} shadow="md" borderRadius="lg" mb={6} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">اضافه کردن مقدار جدید</Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleAddCode}>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                    {Object.keys(newCode).map((key) => (
                      <FormControl key={key}>
                        <FormLabel fontSize="sm">{key}</FormLabel>
                        <Input
                          size="sm"
                          value={newCode[key]}
                          onChange={(e) => setNewCode({ ...newCode, [key]: e.target.value })}
                          placeholder={key}
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                  <Button 
                    mt={6} 
                    colorScheme="blue" 
                    type="submit" 
                    isLoading={loading}
                    w={{ base: "full", md: "auto" }}
                  >
                    اضافه کردن
                  </Button>
                </form>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Users Tab */}
          <TabPanel>
            <Card bg={cardBg} shadow="md" borderRadius="lg" mb={6} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">ایجاد کاربر جدید</Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleCreateUser}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>نام</FormLabel>
                      <Input
                        value={newUser.first_name}
                        onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>نام خانوادگی</FormLabel>
                      <Input
                        value={newUser.last_name}
                        onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>نام کاربری</FormLabel>
                      <Input
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>رمز عبور</FormLabel>
                      <Input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </FormControl>
                  </SimpleGrid>
                  <FormControl mt={4}>
                    <FormLabel>پرمیشن‌ها (با کاما جدا کنید)</FormLabel>
                    <Input
                      onChange={(e) => setNewUser({ ...newUser, permissions: e.target.value.split(',') })}
                    />
                  </FormControl>
                  <Button 
                    mt={6} 
                    colorScheme="blue" 
                    type="submit" 
                    isLoading={loading}
                    w={{ base: "full", md: "auto" }}
                  >
                    ایجاد کاربر
                  </Button>
                </form>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Reports Tab */}
          <TabPanel>
            <Card bg={cardBg} shadow="md" borderRadius="lg" mb={6} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">گزارش محصولات</Heading>
              </CardHeader>
              <CardBody>
                <Button 
                  colorScheme="blue" 
                  mb={6} 
                  onClick={handleExport}
                  isLoading={loading}
                >
                  خروجی اکسل
                </Button>
                
                <Box overflowX="auto">
                  <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead bg={tableBg}>
                      <Tr>
                        <Th>کاربر</Th>
                        <Th>نام محصول</Th>
                        <Th>زمان</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {logs.length > 0 ? (
                        logs.map((log, index) => (
                          <Tr key={index}>
                            <Td>{log.user}</Td>
                            <Td>{log.product_name}</Td>
                            <Td>{new Date(log.created_at).toLocaleString()}</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={3} textAlign="center">هیچ لاگی یافت نشد</Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Admin;