import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  useToast,
  Alert,
  Flex
} from '@chakra-ui/react';

const ProfilePage = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);

      const response = await fetch('http://localhost:8000/update_profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        toast({
          title: 'پروفایل بروزرسانی شد',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const data = await response.json();
        setError(data.detail || 'خطا در بروزرسانی پروفایل');
      }
    } catch (err) {
      setError('اتصال به سرور ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('رمز عبور جدید و تکرار آن مطابقت ندارند');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);

      const response = await fetch('http://localhost:8000/update_password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast({
          title: 'رمز عبور با موفقیت تغییر کرد',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const data = await response.json();
        // Fix error message handling
        const errorMessage = Array.isArray(data.detail) ? 
          data.detail.map(err => err.msg).join(', ') : 
          (data.detail || 'خطا در تغییر رمز عبور');
        setError(errorMessage);
      }
    } catch (err) {
      setError('اتصال به سرور ناموفق بود');
    } finally {
      setLoading(false);
    }
};

  return (
    <Box>
      <Heading mb={6}>پروفایل کاربری</Heading>
      
      {error && (
        <Alert status="error" mb={6}>
          {error}
        </Alert>
      )}
      
      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        <Card flex={{ base: '1', md: '1' }}>
          <CardBody>
            <VStack spacing={4} align="center">
              <Avatar 
                size="2xl" 
                name={`${firstName} ${lastName}`} 
                src={user?.avatar} 
              />
              <Text fontSize="xl" fontWeight="bold">
                {firstName} {lastName}
              </Text>
              <Text color="gray.500">{user?.username || 'کاربر'}</Text>
            </VStack>
          </CardBody>
        </Card>
        
        <Card flex={{ base: '1', md: '2' }}>
          <CardBody>
            <Heading size="md" mb={4}>اطلاعات شخصی</Heading>
            
            <form onSubmit={handleUpdateProfile}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>نام</FormLabel>
                    <Input 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>نام خانوادگی</FormLabel>
                    <Input 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </FormControl>
                </HStack>
                
                <FormControl>
                  <FormLabel>نام کاربری</FormLabel>
                  <Input 
                    value={user?.username || ''}
                    isReadOnly
                    bg="gray.50"
                  />
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="brand" 
                  isLoading={loading}
                >
                  ذخیره تغییرات
                </Button>
              </VStack>
            </form>
            
            <Divider my={6} />
            
            <Heading size="md" mb={4}>تغییر رمز عبور</Heading>
            
            <form onSubmit={handleChangePassword}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>رمز عبور فعلی</FormLabel>
                  <Input 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>رمز عبور جدید</FormLabel>
                  <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>تکرار رمز عبور جدید</FormLabel>
                  <Input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="brand" 
                  isLoading={loading}
                >
                  تغییر رمز عبور
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
};

export default ProfilePage;