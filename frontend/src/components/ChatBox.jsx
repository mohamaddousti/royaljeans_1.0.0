import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  useColorModeValue,
  HStack,
  Avatar,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FaPaperPlane, FaUserFriends, FaCog } from 'react-icons/fa';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const chatboxRef = useRef(null); // Ref for the chatbox container

  const toggleChatbox = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      // Simulate sending message to a server (replace with your actual logic)
      setMessages([...messages, { text: newMessage, sender: 'Me' }]);
      setNewMessage('');
    }
  };

  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.800');

  return (
    <Box
      position="fixed"
      bottom="0"
      right="0"
      width={isExpanded ? '350px' : 'auto'}
      maxWidth="100%"
      bg={bgColor}
      color={textColor}
      borderRadius="md"
      boxShadow="md"
      overflow="hidden"
      transition="width 0.3s ease-in-out"
      zIndex="10"
    >
      {/* Header */}
      <HStack
        bg={useColorModeValue('gray.200', 'gray.600')}
        p={2}
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        onClick={toggleChatbox}
      >
        <HStack>
          <Avatar size="sm" name="Online Users" icon={<FaUserFriends />} />
          <Text fontWeight="bold" fontSize="sm">
            {isExpanded ? 'Chat Room' : 'Open Chat'}
          </Text>
        </HStack>
        <HStack>
          {isExpanded && (
            <Tooltip label="Settings">
              <IconButton
                aria-label="Settings"
                icon={<FaCog />}
                size="sm"
                variant="ghost"
              />
            </Tooltip>
          )}
        </HStack>
      </HStack>

      {/* Chat Messages */}
      {isExpanded && (
        <VStack
          p={2}
          spacing={2}
          maxH="300px"
          overflowY="auto"
          ref={chatboxRef} // Attach the ref to the container
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              alignSelf={message.sender === 'Me' ? 'flex-end' : 'flex-start'}
              bg={message.sender === 'Me' ? 'blue.500' : 'gray.400'}
              color="white"
              borderRadius="md"
              px={3}
              py={1}
            >
              <Text fontSize="sm">{message.text}</Text>
            </Box>
          ))}
        </VStack>
      )}

      {/* Message Input */}
      {isExpanded && (
        <HStack p={2}>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            bg={inputBg}
          />
          <IconButton
            aria-label="Send message"
            icon={<FaPaperPlane />}
            onClick={handleSendMessage}
          />
        </HStack>
      )}
    </Box>
  );
};

export default ChatBox;