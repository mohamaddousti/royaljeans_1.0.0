import React from 'react';
import { Box, Heading, Text, Flex, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Icon, Card, CardBody } from '@chakra-ui/react';
import { FaBox, FaUser, FaHistory } from 'react-icons/fa';

const Dashboard = ({ user }) => {
  return (
    <Box>
      <Heading mb={6}>سلام {user?.first_name || 'کاربر'} 👋</Heading>
      
      <Text fontSize="lg" mb={6}>
        به داشبورد مدیریت Royal Jeans خوش آمدید.
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <Flex align="center">
                <Icon as={FaBox} color="brand.500" boxSize={6} mr={2} />
                <StatLabel fontSize="lg">محصولات</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl" mt={2}>0</StatNumber>
              <StatHelpText>محصولات تولید شده</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <Flex align="center">
                <Icon as={FaUser} color="green.500" boxSize={6} mr={2} />
                <StatLabel fontSize="lg">کاربران</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl" mt={2}>1</StatNumber>
              <StatHelpText>کاربران فعال</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <Flex align="center">
                <Icon as={FaHistory} color="purple.500" boxSize={6} mr={2} />
                <StatLabel fontSize="lg">فعالیت‌ها</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl" mt={2}>0</StatNumber>
              <StatHelpText>فعالیت‌های اخیر</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>راهنمای سریع</Heading>
          <Text>
            برای تولید محصول جدید، به صفحه "تولید محصول" بروید و کد 29 رقمی و کد اضافی را وارد کنید.
            محصولات تولید شده در صفحه "لیست محصولات" قابل مشاهده هستند.
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;