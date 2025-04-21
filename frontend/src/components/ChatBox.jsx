import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Input,
  IconButton,
  Text,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Avatar,
  InputGroup,
  InputRightElement,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FaPaperPlane, 
  FaUsers, 
  FaTimes,
  FaComments,
  FaCommentDots,
  FaUserFriends,
  FaPaperclip,
} from 'react-icons/fa';
import './Chatbox.css';

const WS_URL = 'ws://localhost:8000/ws';

const ChatBox = ({ user, bg, color }) => {
  const [messages, setMessages] = useState([]);
  const [privateChats, setPrivateChats] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const wsRef = useRef(null);
  const chatboxRef = useRef(null);
  const privateChatRefs = useRef({});
  const toast = useToast();
  const location = useLocation();

  // Theme-aware colors
  const chatBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const headerBg = useColorModeValue('linear-gradient(145deg, #3182ce, #2b6cb0)', 'linear-gradient(145deg, #2c5282, #2a4365)');
  const messageBgSelf = useColorModeValue('blue.100', 'blue.700');
  const messageBgOther = useColorModeValue('gray.100', 'gray.600');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('#f7fafc', 'gray.700');
  const onlineUsersBg = useColorModeValue('blue.50', 'gray.700');
  const buttonBg = useColorModeValue('blue.500', 'blue.600');

  console.log('ChatBox render - user:', user, 'token:', localStorage.getItem('token'));

  const connectWebSocket = useCallback(() => {
    if (!user?.id || !localStorage.getItem('token')) {
      console.log('WebSocket not connecting: missing user.id or token');
      return;
    }

    let retryCount = 0;
    const maxRetries = 5;

    const attemptConnection = () => {
      if (retryCount >= maxRetries) {
        console.log('Max WebSocket retry attempts reached');
        toast({
          title: 'Connection Failed',
          description: 'Unable to connect to chat server after multiple attempts.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      console.log('Attempting WebSocket connection for user:', user.id);
      try {
        const socket = new WebSocket(`${WS_URL}/${user.id}`);

        socket.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          retryCount = 0;
          const token = localStorage.getItem('token');
          console.log('Sending auth token:', token);
          socket.send(
            JSON.stringify({
              type: 'authenticate',
              token,
            })
          );
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);

          if (data.type === 'public_message') {
            setMessages((prev) => [...prev, data.message]);
          } else if (data.type === 'private_message' || data.type === 'file_message') {
            const senderId = data.message.sender.id;
            setPrivateChats((prev) => ({
              ...prev,
              [senderId]: {
                messages: [...(prev[senderId]?.messages || []), data.message],
                user: data.message.sender,
              },
            }));
          } else if (data.type === 'online_users') {
            setOnlineUsers(data.users);
          } else if (data.type === 'error') {
            toast({
              title: 'Chat Error',
              description: data.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        };

        socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          retryCount++;
          setTimeout(() => {
            console.log('Attempting to reconnect...', { retryCount });
            attemptConnection();
          }, 2000);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast({
            title: 'Connection Error',
            description: 'Failed to connect to chat server. Retrying...',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        };

        wsRef.current = socket;
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
        retryCount++;
        setTimeout(attemptConnection, 2000);
      }
    };

    attemptConnection();
  }, [user?.id, toast]);

  useEffect(() => {
    console.log('useEffect - user.id:', user?.id, 'token:', localStorage.getItem('token'), 'wsRef.current:', wsRef.current, 'isExpanded:', isExpanded);
    if (isExpanded && user?.id && !wsRef.current) {
      connectWebSocket();
    }

    return () => {
      console.log('Cleaning up WebSocket');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket, isExpanded, user?.id]);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
    console.log('Messages updated, count:', messages.length);
  }, [messages]);

  useEffect(() => {
    Object.keys(privateChatRefs.current).forEach((userId) => {
      const ref = privateChatRefs.current[userId];
      if (ref) {
        ref.scrollTop = ref.scrollHeight;
      }
    });
  }, [privateChats]);

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected || !wsRef.current) {
      console.log('Cannot send message:', { newMessage, isConnected, wsRef: wsRef.current });
      return;
    }

    const message = {
      type: activeTab === 0 ? 'public_message' : 'private_message',
      message: {
        text: newMessage,
        timestamp: new Date().toISOString(),
        ...(activeTab !== 0 && { recipientId: parseInt(Object.keys(privateChats)[activeTab - 1]) }),
      },
    };

    wsRef.current.send(JSON.stringify(message));
    setNewMessage('');
  };

  const sendFile = () => {
    if (!selectedFile || !isConnected || !wsRef.current) {
      console.log('Cannot send file:', { selectedFile, isConnected, wsRef: wsRef.current });
      toast({
        title: 'File Error',
        description: 'No file selected or not connected.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      wsRef.current.send(reader.result); // Send file as binary
      wsRef.current.send(
        JSON.stringify({
          type: 'file_message',
          message: {
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            recipientId: activeTab !== 0 ? parseInt(Object.keys(privateChats)[activeTab - 1]) : null,
          },
        })
      );
      setSelectedFile(null);
      toast({
        title: 'File Sent',
        description: `${selectedFile.name} sent successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    };
    reader.onerror = () => {
      toast({
        title: 'File Error',
        description: 'Failed to read file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleStartPrivateChat = (userObj) => {
    if (!privateChats[userObj.id]) {
      setPrivateChats((prev) => ({
        ...prev,
        [userObj.id]: { messages: [], user: userObj },
      }));
    }
    const tabIndex = Object.keys(privateChats).findIndex((id) => String(id) === String(userObj.id));
    setActiveTab(tabIndex === -1 ? Object.keys(privateChats).length + 1 : tabIndex + 1);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const renderMessageInput = () => {
    console.log('Rendering message input', { newMessage, isConnected, isDisabled: !newMessage.trim() || !isConnected });
    return (
      <Box className="chatbox-footer" bg={chatBg} borderColor={borderColor}>
        <HStack spacing={2} w="100%">
          <Input
            className="chatbox-footer-input"
            placeholder="پیام خود را بنویسید..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            flex="1"
            minW="0"
            minH="40px"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="5px"
            padding="8px"
            bg={inputBg}
            color={textColor}
            fontSize="0.9rem"
            _focus={{ borderColor: 'blue.500' }}
          />
          <Input
            type="file"
            onChange={handleFileChange}
            display="none"
            id="file-upload"
          />
          <IconButton
            as="label"
            htmlFor="file-upload"
            aria-label="Upload file"
            icon={<FaPaperclip />}
            isRound
            colorScheme="blue"
            minW="40px"
            minH="40px"
          />
          <IconButton
            className="chatbox-footer-button"
            aria-label="Send message"
            icon={<FaPaperPlane />}
            onClick={selectedFile ? sendFile : sendMessage}
            isRound
            bg={buttonBg}
            color="white"
            isDisabled={(!newMessage.trim() && !selectedFile) || !isConnected}
            minW="40px"
            minH="40px"
          />
        </HStack>
      </Box>
    );
  };

  if (!isExpanded) {
    console.log('Rendering collapsed chat button', { isExpanded });
    return (
      <Box
        position="fixed"
        bottom={4}
        left={4}
        w="60px"
        h="60px"
        borderRadius="full"
        bg={buttonBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        onClick={() => {
          console.log('Chat button clicked, setting isExpanded to true');
          setIsExpanded(true);
        }}
      >
        <FaComments size={24} color="white" />
      </Box>
    );
  }

  const renderMessage = (message, isPrivate = false) => (
    <Box
      key={message.id}
      p={2}
      borderRadius="md"
      bg={message.sender.id === user.id ? messageBgSelf : messageBgOther}
      alignSelf={message.sender.id === user.id ? 'flex-end' : 'flex-start'}
      maxW="70%"
      display="flex"
      flexDirection="row"
      alignItems="flex-end"
    >
      {message.sender.avatar && (
        <img
          src={message.sender.avatar}
          alt={message.sender.first_name || message.sender.username}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            marginLeft: 8,
            marginRight: message.sender.id === user.id ? 0 : 8,
          }}
        />
      )}
      <Box>
        <Text fontWeight="bold" fontSize="xs" color={useColorModeValue('blue.700', 'blue.200')}>
          {message.sender.first_name || message.sender.username}
        </Text>
        {message.fileUrl ? (
          <a href={message.fileUrl} download target="_blank" rel="noopener noreferrer" className="chatbox-file-message">
            <Text color={useColorModeValue('blue.600', 'blue.300')} fontWeight="bold">📎 {message.fileName}</Text>
          </a>
        ) : (
          <Text fontSize="sm" color={textColor}>{message.text}</Text>
        )}
        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
          {new Date(message.timestamp).toLocaleTimeString('fa-IR')}
        </Text>
      </Box>
    </Box>
  );

  return (
    <Box
      position="fixed"
      bottom={4}
      left={4}
      w={{ base: '95%', md: '420px' }}
      h={{ base: '85vh', md: '75vh' }}
      bg={bg || chatBg}
      borderRadius="lg"
      boxShadow="2xl"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
      color={color || textColor}
    >
      {/* Header */}
      <Flex
        p={3}
        bg={headerBg}
        color="white"
        align="center"
        justify="space-between"
      >
        <Text fontSize="lg" fontWeight="bold">
          <FaCommentDots style={{ display: 'inline', marginLeft: '8px' }} />
          گفتگو آنلاین
        </Text>
        <IconButton
          icon={<FaTimes />}
          onClick={() => setIsExpanded(false)}
          size="xs"
          variant="ghost"
          colorScheme="whiteAlpha"
          aria-label="Close chat"
          p={1}
          ml={2}
        />
      </Flex>

      {/* Main Content */}
      <Tabs variant="soft-rounded" colorScheme="blue" flex={1} display="flex" flexDirection="column">
        <TabList px={3} pt={2} bg={chatBg}>
          <Tab fontSize="sm">
            <FaUsers style={{ marginLeft: '6px' }} />
            عمومی
          </Tab>
          {Object.entries(privateChats).map(([userId, chat]) => (
            <Tab key={userId} fontSize="sm">
              {chat.user.first_name || chat.user.username}
              <FaTimes 
                style={{ marginRight: '6px', cursor: 'pointer' }} 
                onClick={(e) => {
                  e.stopPropagation();
                  setPrivateChats(prev => {
                    const newChats = { ...prev };
                    delete newChats[userId];
                    return newChats;
                  });
                  if (activeTab === Object.keys(privateChats).indexOf(userId) + 1) {
                    setActiveTab(0);
                  }
                }}
              />
            </Tab>
          ))}
        </TabList>

        <TabPanels flex={1} overflow="hidden">
          {/* Public Chat */}
          <TabPanel p={0} h="full" display="flex" flexDirection="column">
            {/* Online Users */}
            <Box
              p={3}
              bg={onlineUsersBg}
              borderBottomWidth="1px"
              borderColor={borderColor}
            >
              <Flex align="center" mb={2}>
                <FaUserFriends style={{ marginLeft: '6px' }} />
                <Text fontWeight="semibold" color={textColor}>
                  کاربران آنلاین ({onlineUsers.length - 1})
                </Text>
              </Flex>
              <Flex overflowX="auto" pb={2}>
                {onlineUsers
                  .filter(u => u.id !== user.id)
                  .map(u => (
                    <Flex
                      key={u.id}
                      align="center"
                      p={2}
                      mr={2}
                      borderRadius="md"
                      bg={chatBg}
                      boxShadow="sm"
                      cursor="pointer"
                      _hover={{ transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                      onClick={() => handleStartPrivateChat(u)}
                    >
                      <Avatar 
                        src={u.avatar} 
                        name={u.first_name} 
                        size="sm" 
                        mr={2}
                        border="2px solid"
                        borderColor="blue.200"
                      />
                      <Text fontSize="sm" fontWeight="500" color={textColor}>
                        {u.first_name || u.username}
                      </Text>
                    </Flex>
                  ))}
              </Flex>
            </Box>

            {/* Messages */}
            <VStack
              flex={1}
              p={3}
              spacing={3}
              overflowY="auto"
              align="stretch"
              ref={chatboxRef}
              className="chatbox-messages"
            >
              {messages.length === 0 ? (
                <Flex 
                  justify="center" 
                  align="center" 
                  h="full" 
                  flexDirection="column"
                  color={useColorModeValue('gray.500', 'gray.400')}
                >
                  <FaComments size={32} />
                  <Text mt={2}>شروع مکالمه</Text>
                </Flex>
              ) : (
                messages.map(message => (
                  <Flex
                    key={message.id}
                    direction={message.sender.id === user.id ? 'row-reverse' : 'row'}
                    align="flex-end"
                    gap={2}
                  >
                    <Avatar
                      src={message.sender.avatar}
                      name={message.sender.first_name}
                      size="sm"
                      border="2px solid"
                      borderColor={message.sender.id === user.id ? 'blue.200' : 'gray.200'}
                    />
                    <Box
                      maxW="80%"
                      p={3}
                      borderRadius="xl"
                      bg={message.sender.id === user.id ? messageBgSelf : messageBgOther}
                      color={message.sender.id === user.id ? 'white' : textColor}
                      boxShadow="sm"
                    >
                      {message.fileUrl ? (
                        <a href={message.fileUrl} download className="chatbox-file-message">
                          <Flex align="center">
                            📎
                            <Text ml={2} fontWeight="600">{message.fileName}</Text>
                          </Flex>
                        </a>
                      ) : (
                        <Text>{message.text}</Text>
                      )}
                      <Text 
                        fontSize="xs" 
                        mt={1}
                        color={message.sender.id === user.id ? 'blue.100' : useColorModeValue('gray.500', 'gray.400')}
                      >
                        {new Date(message.timestamp).toLocaleTimeString('fa-IR')}
                      </Text>
                    </Box>
                  </Flex>
                ))
              )}
            </VStack>

            {/* Input Area */}
            {renderMessageInput()}
          </TabPanel>

          {/* Private Chats */}
          {Object.entries(privateChats).map(([userId, chat]) => (
            <TabPanel key={userId} p={0} h="full" display="flex" flexDirection="column">
              <VStack
                flex={1}
                p={3}
                spacing={3}
                overflowY="auto"
                align="stretch"
                ref={(el) => (privateChatRefs.current[userId] = el)}
                className="chatbox-messages"
              >
                {chat.messages.length === 0 ? (
                  <Flex 
                    justify="center" 
                    align="center" 
                    h="full" 
                    flexDirection="column"
                    color={useColorModeValue('gray.500', 'gray.400')}
                  >
                    <FaComments size={32} />
                    <Text mt={2}>شروع مکالمه خصوصی</Text>
                  </Flex>
                ) : (
                  chat.messages.map(message => renderMessage(message, true))
                )}
              </VStack>
              {renderMessageInput()}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ChatBox;