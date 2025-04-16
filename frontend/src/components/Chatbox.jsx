import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Avatar, Typography, Paper, Dialog, Slide } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Chatbox = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'سلام! چطور می‌تونم بهت کمک کنم؟', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: input, time: new Date() }
      ]);
      setInput('');
      // TODO: Send message to backend via WebSocket or API
    }
  };

  return (
    <>
      <IconButton
        color="primary"
        sx={{ position: 'fixed', bottom: 24, left: 24, zIndex: 1300, bgcolor: 'white', boxShadow: 3 }}
        onClick={() => setOpen(true)}
      >
        <ChatIcon />
      </IconButton>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: 350, height: 500, borderRadius: 3, p: 0, m: 0 }
        }}
      >
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>R</Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>پشتیبانی Royal Jeans</Typography>
          <IconButton color="inherit" onClick={() => setOpen(false)}>✕</IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default', height: 370 }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', mb: 1 }}>
              <Avatar sx={{ bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.400', width: 32, height: 32, ml: 1, mr: 1 }}>
                {msg.sender === 'user' ? (user?.first_name?.[0] || 'U') : 'R'}
              </Avatar>
              <Paper sx={{
                p: 1.5, borderRadius: 2, bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.100',
                color: msg.sender === 'user' ? 'white' : 'black', minWidth: 60, maxWidth: 220
              }}>
                <Typography variant="body2">{msg.text}</Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderTop: '1px solid #eee' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="پیام خود را بنویسید..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          />
          <IconButton color="primary" onClick={sendMessage} sx={{ ml: 1 }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Dialog>
    </>
  );
};

export default Chatbox;