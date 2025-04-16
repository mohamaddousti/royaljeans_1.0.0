import React, { useState } from "react";
import { Box, IconButton, Badge } from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";

function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <Box position="fixed" bottom="0" left="0" p="4">
      <IconButton
        icon={<ChatIcon />}
        onClick={toggleChat}
        aria-label="Open chat"
      />
      {unreadMessages > 0 && (
        <Badge colorScheme="red" ml="1">
          {unreadMessages}
        </Badge>
      )}
      {isOpen && (
        <Box bg="gray.700" p="4" borderRadius="md">
          {/* Chat room and user list */}
        </Box>
      )}
    </Box>
  );
}

export default ChatBox;