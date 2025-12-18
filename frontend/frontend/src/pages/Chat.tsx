import { useState } from "react";
import { apiFetch } from "../api";
import { Box, TextField, Button, Paper, Typography, Chip, Stack, Avatar, CircularProgress } from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

export default function Chat({ assetIds, onBack }: { assetIds: number[], onBack: () => void }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const res = await apiFetch("/chat/", { method: "POST", body: JSON.stringify({ question, asset_ids: assetIds }) });
    const data = await res.json();
    setMessages([...messages, { q: question, a: data.answer, sources: data.sources }]);
    setQuestion("");
    setLoading(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <Button onClick={onBack} sx={{ alignSelf: 'flex-start', mb: 2 }}>← Back to Files</Button>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#fff', borderRadius: 2, mb: 2, border: '1px solid #eee' }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}><PersonIcon /></Avatar>
              <Paper sx={{ p: 2, bgcolor: '#e3f2fd', maxWidth: '80%' }}>
                <Typography variant="body1">{m.q}</Typography>
              </Paper>
            </Stack>
            
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxWidth: '80%' }}>
                <Typography variant="body1">{m.a}</Typography>
                <Box sx={{ mt: 1 }}>
                  {m.sources.map((s: any, idx: number) => (
                    <Chip key={idx} label={s.filename} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                  ))}
                </Box>
              </Paper>
              <Avatar sx={{ bgcolor: 'secondary.main' }}><SmartToyIcon /></Avatar>
            </Stack>
          </Box>
        ))}
        {loading && <CircularProgress size={24} sx={{ display: 'block', m: 'auto' }} />}
      </Box>

      <Stack direction="row" spacing={1}>
        <TextField fullWidth placeholder="Ask a question about your documents..." value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Button variant="contained" onClick={ask} disabled={loading}>Send</Button>
      </Stack>
    </Box>
  );
}