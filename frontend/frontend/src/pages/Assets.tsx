import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { Card, CardContent, Typography, Button, List, ListItem, ListItemText, Checkbox, IconButton, LinearProgress, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function Assets({ onChat }: { onChat: (ids: number[]) => void }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadAssets = async () => {
    const res = await apiFetch("/assets/");
    if (res.ok) setAssets(await res.json());
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    await apiFetch("/assets/upload/", { method: "POST", body: form });
    setUploading(false);
    loadAssets();
  };

  useEffect(() => { loadAssets(); }, []);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Knowledge Base</Typography>
        
        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} sx={{ mb: 2 }}>
          Upload PDF/Image
          <input type="file" hidden onChange={handleUpload} />
        </Button>

        {uploading && <Box sx={{ mb: 2 }}><LinearProgress /><Typography variant="caption">Vectorizing file...</Typography></Box>}

        <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          {assets.map((a) => (
            <ListItem key={a.id} divider>
              <Checkbox checked={selected.includes(a.id)} onChange={() => 
                setSelected(prev => prev.includes(a.id) ? prev.filter(i => i !== a.id) : [...prev, a.id])
              } />
              <ListItemText primary={a.filename} secondary={a.type.toUpperCase()} />
            </ListItem>
          ))}
        </List>

        <Button fullWidth variant="contained" color="primary" sx={{ mt: 3 }} 
          disabled={selected.length === 0} onClick={() => onChat(selected)}>
          Chat with {selected.length} Selected Files
        </Button>
      </CardContent>
    </Card>
  );
}