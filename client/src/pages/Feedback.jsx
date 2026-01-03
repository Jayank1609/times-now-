import React, { useState } from 'react';
import { Paper, Stack, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

export default function Feedback() {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);

  async function submit() {
    await axios.post('/api/feedback', { message, contact });
    setSent(true);
    setMessage('');
    setContact('');
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>We value your feedback</Typography>
      {sent && <Typography color="success.main" sx={{ mb: 2 }}>Thanks! We received your feedback.</Typography>}
      <Stack spacing={2}>
        <TextField label="Your feedback" multiline minRows={4} value={message} onChange={e=>setMessage(e.target.value)} />
        <TextField label="Contact (optional)" value={contact} onChange={e=>setContact(e.target.value)} />
        <Button variant="contained" disabled={!message.trim()} onClick={submit}>Send</Button>
      </Stack>
    </Paper>
  );
}

