import React, { useEffect, useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { 
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, TextField, IconButton, Paper, Avatar, 
  Chip, CircularProgress, Button, Tooltip, Stack, Alert, Snackbar, AlertColor
} from "@mui/material";
import { 
  Send as SendIcon, Description as FileIcon, 
  Image as ImageIcon, SmartToy as RobotIcon, Person as UserIcon,
  CloudUpload as UploadIcon, Delete as DeleteIcon, Logout as LogoutIcon,
  FiberManualRecord as DotIcon, Article as ArticleIcon, InsertDriveFile as DocIcon
} from "@mui/icons-material";
import { apiFetch } from "../api";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Asset {
  id: number;
  filename: string;
  type: 'image' | 'document' | 'pdf' | 'text';
  file_path: string;
  uploaded_at: string;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  sources?: Source[];
}

interface Source {
  filename: string;
  page?: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface ChatResponse {
  answer: string;
  sources?: Source[];
}

interface ErrorResponse {
  detail?: string;
}

// ============================================
// CONSTANTS
// ============================================

const drawerWidth = 280;

const ALLOWED_FILE_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPG'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ============================================
// HELPER FUNCTIONS
// ============================================

const getFileIcon = (filename: string, type: string): React.ReactElement => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (type === 'image' || ['png', 'jpg', 'jpeg'].includes(ext || '')) {
    return <ImageIcon sx={{ fontSize: 20, color: '#10b981' }} />;
  }
  if (ext === 'pdf') {
    return <FileIcon sx={{ fontSize: 20, color: '#ef4444' }} />;
  }
  if (ext === 'docx') {
    return <DocIcon sx={{ fontSize: 20, color: '#3b82f6' }} />;
  }
  if (ext === 'txt') {
    return <ArticleIcon sx={{ fontSize: 20, color: '#f59e0b' }} />;
  }
  
  return <FileIcon sx={{ fontSize: 20, color: '#666' }} />;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Dashboard(): React.ReactElement {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => { 
    loadAssets(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { 
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const showSnackbar = (message: string, severity: AlertColor = 'info'): void => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (): void => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const validateFile = (file: File | null): ValidationResult => {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    if (!ALLOWED_FILE_TYPES[file.type]) {
      const allowedTypes = Object.values(ALLOWED_FILE_TYPES).join(', ');
      return { 
        valid: false, 
        error: `Invalid file type "${file.type}". Allowed: ${allowedTypes}` 
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return { 
        valid: false, 
        error: `File too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum: ${sizeMB}MB` 
      };
    }

    if (file.size === 0) {
      return { valid: false, error: "File is empty" };
    }

    return { valid: true };
  };

  // ============================================
  // API FUNCTIONS
  // ============================================

  const loadAssets = async (): Promise<void> => {
    try {
      const res = await apiFetch("/assets/");
      
      if (res.status === 401) {
        showSnackbar("Session expired. Please login again.", 'error');
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load assets: ${res.status}`);
      }

      const data: Asset[] = await res.json();
      setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
      showSnackbar("Failed to load files. Please refresh the page.", 'error');
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0] || null;
    
    const validation = validateFile(file);
    if (!validation.valid) {
      showSnackbar(validation.error || "Invalid file", 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    
    try {
      const form = new FormData();
      form.append("file", file!);
      
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("Authentication required. Please login.", 'error');
        handleLogout();
        return;
      }

      const res = await fetch("http://localhost:8000/assets/upload/", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}` 
        },
        body: form
      });

      if (res.status === 401) {
        showSnackbar("Session expired. Please login again.", 'error');
        handleLogout();
        return;
      }

      if (res.status === 413) {
        showSnackbar("File too large for server. Try a smaller file.", 'error');
        return;
      }

      if (res.status === 415) {
        showSnackbar("Unsupported file type.", 'error');
        return;
      }

      if (res.status === 400) {
        const errorData: ErrorResponse = await res.json().catch(() => ({}));
        showSnackbar(errorData.detail || "Invalid file format or corrupted file.", 'error');
        return;
      }

      if (res.status === 500) {
        showSnackbar("Server error during file processing. Please try again.", 'error');
        return;
      }

      if (!res.ok) {
        const errorData: ErrorResponse = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
      }

      const fileType = ALLOWED_FILE_TYPES[file!.type];
      showSnackbar(`${fileType} file "${file!.name}" uploaded successfully!`, 'success');
      await loadAssets();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showSnackbar("Network error. Please check your connection.", 'error');
      } else if (error instanceof Error) {
        showSnackbar(error.message || "Upload failed. Please try again.", 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (id: number): Promise<void> => {
    if (!window.confirm("Delete this file? This action cannot be undone.")) return;
    
    try {
      const res = await apiFetch(`/assets/${id}/`, { method: "DELETE" });
      
      if (res.status === 401) {
        showSnackbar("Session expired. Please login again.", 'error');
        handleLogout();
        return;
      }

      if (res.status === 404) {
        showSnackbar("File not found. It may have been already deleted.", 'warning');
        await loadAssets();
        return;
      }

      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }

      setSelectedIds(prev => prev.filter(i => i !== id));
      showSnackbar("File deleted successfully", 'success');
      await loadAssets();
    } catch (error) {
      console.error('Delete error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showSnackbar("Network error. Please check your connection.", 'error');
      } else {
        showSnackbar("Failed to delete file. Please try again.", 'error');
      }
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSend = async (): Promise<void> => {
    // Validation: Check if message is not empty
    if (!input.trim()) {
      showSnackbar("Please enter a message", 'warning');
      return;
    }

    // Prevent multiple simultaneous requests
    if (loading) return;

    const userMsg = input.trim();
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("Authentication required. Please login.", 'error');
        handleLogout();
        return;
      }

      const res = await apiFetch("/api/chat/", {
        method: "POST",
        body: JSON.stringify({
          question: userMsg,
          asset_ids: selectedIds.length > 0 ? selectedIds : undefined
        })
      });

      if (res.status === 401) {
        showSnackbar("Session expired. Please login again.", 'error');
        handleLogout();
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: "Session expired. Please login again." 
        }]);
        return;
      }

      if (res.status === 400) {
        const errorData: ErrorResponse = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid request");
      }

      if (res.status === 404) {
        throw new Error("One or more selected files not found. Please refresh and try again.");
      }

      if (res.status === 500) {
        throw new Error("Server error. Please try again later.");
      }

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data: ChatResponse = await res.json();
      
      if (!data.answer) {
        throw new Error("Invalid response from server");
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.answer,
        sources: data.sources || []
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = "Error connecting to server.";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        text: errorMessage
      }]);
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const toggleSelect = (id: number): void => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#0a0a0a' }}>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* SIDEBAR: Knowledge Base */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            bgcolor: '#111111', 
            borderRight: '1px solid #1f1f1f',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #1f1f1f' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#fff' }}>
              Knowledge Base
            </Typography>
            <Tooltip title="Logout" placement="bottom">
              <IconButton 
                onClick={handleLogout} 
                size="small"
                sx={{ 
                  color: '#888',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: 'rgba(239, 68, 68, 0.1)', 
                    color: '#ef4444',
                    transform: 'rotate(90deg)'
                  }
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            id="file-upload"
            onChange={handleUpload}
            accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button 
              fullWidth 
              component="span"
              startIcon={<UploadIcon />} 
              disabled={uploading}
              sx={{ 
                bgcolor: '#3b82f6', 
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.25,
                borderRadius: 2,
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                border: 'none',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: '#2563eb',
                  boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.6)',
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  bgcolor: '#1f1f1f',
                  color: '#555'
                }
              }}
            >
              {uploading ? "Processing..." : "Upload File"}
            </Button>
          </label>
          
          {uploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={20} sx={{ color: '#3b82f6' }} />
              <Typography variant="caption" sx={{ ml: 1, color: '#888' }}>
                Analyzing document...
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#1a1a1a', borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>
              Supported formats:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip label="PDF" size="small" sx={{ bgcolor: '#0f0f0f', color: '#ef4444', fontSize: '0.7rem' }} />
              <Chip label="TXT" size="small" sx={{ bgcolor: '#0f0f0f', color: '#f59e0b', fontSize: '0.7rem' }} />
              <Chip label="DOCX" size="small" sx={{ bgcolor: '#0f0f0f', color: '#3b82f6', fontSize: '0.7rem' }} />
              <Chip label="PNG" size="small" sx={{ bgcolor: '#0f0f0f', color: '#10b981', fontSize: '0.7rem' }} />
              <Chip label="JPG" size="small" sx={{ bgcolor: '#0f0f0f', color: '#10b981', fontSize: '0.7rem' }} />
            </Stack>
          </Box>
        </Box>

        <Box sx={{ px: 2, py: 1.5, bgcolor: '#0a0a0a', borderBottom: '1px solid #1f1f1f' }}>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {assets.length} {assets.length === 1 ? 'File' : 'Files'}
          </Typography>
        </Box>
        
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
          {assets.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <FileIcon sx={{ fontSize: 48, color: '#222', mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#555' }}>
                No files yet
              </Typography>
              <Typography variant="caption" sx={{ color: '#333' }}>
                Upload a document to get started
              </Typography>
            </Box>
          ) : (
            assets.map((asset: Asset) => (
              <ListItem 
                key={asset.id} 
                disablePadding
                sx={{ mb: 0.5 }}
              >
                <ListItemButton 
                  onClick={() => toggleSelect(asset.id)} 
                  selected={selectedIds.includes(asset.id)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(59, 130, 246, 0.15)',
                      borderLeft: '3px solid #3b82f6',
                      '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.25)' }
                    },
                    '&:hover': { bgcolor: '#1a1a1a' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getFileIcon(asset.filename, asset.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={asset.filename} 
                    primaryTypographyProps={{ 
                      noWrap: true, 
                      fontSize: '0.875rem', 
                      fontWeight: selectedIds.includes(asset.id) ? 600 : 400,
                      color: selectedIds.includes(asset.id) ? '#fff' : '#999'
                    }}
                  />
                  <Tooltip title="Delete file">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAsset(asset.id);
                      }}
                      sx={{ 
                        color: '#555',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          color: '#ef4444',
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Drawer>

      {/* MAIN CHAT AREA */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#0a0a0a' }}>
        <AppBar 
          position="static" 
          elevation={0} 
          sx={{ 
            bgcolor: '#111111', 
            borderBottom: '1px solid #1f1f1f',
            color: '#fff'
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
            }}>
              <RobotIcon sx={{ color: '#fff' }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                AI Assistant
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DotIcon sx={{ 
                  fontSize: 8, 
                  color: selectedIds.length > 0 ? '#10b981' : '#444',
                  animation: selectedIds.length > 0 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 }
                  }
                }} />
                <Typography variant="caption" sx={{ color: '#888', fontSize: '0.75rem' }}>
                  {selectedIds.length > 0 
                    ? `${selectedIds.length} ${selectedIds.length === 1 ? 'file' : 'files'} selected` 
                    : "Select files to begin"}
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* MESSAGES WINDOW */}
        <Box 
          ref={scrollRef} 
          sx={{ 
            flexGrow: 1, 
            p: 4, 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3
          }}
        >
          {messages.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              gap: 2
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px 0 rgba(59, 130, 246, 0.3)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' }
                }
              }}>
                <RobotIcon sx={{ fontSize: 40, color: '#fff' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                Ready to assist
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', textAlign: 'center', maxWidth: 400 }}>
                Upload documents to your knowledge base or start chatting directly with the AI assistant.
              </Typography>
            </Box>
          )}

          {messages.map((msg: Message, i: number) => (
            <Box 
              key={i} 
              sx={{ 
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 2,
                animation: 'slideIn 0.4s ease',
                '@keyframes slideIn': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              {msg.role === 'ai' && (
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
                }}>
                  <RobotIcon sx={{ fontSize: 20 }} />
                </Avatar>
              )}
              
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  maxWidth: '70%',
                  bgcolor: msg.role === 'user' ? '#1e293b' : '#111111',
                  color: '#fff',
                  borderRadius: 3,
                  border: '1px solid #1f1f1f',
                  boxShadow: msg.role === 'user' 
                    ? '0 4px 14px 0 rgba(30, 41, 59, 0.5)' 
                    : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: msg.role === 'user' ? '#334155' : '#2a2a2a',
                    transform: 'translateY(-2px)',
                    boxShadow: msg.role === 'user' 
                      ? '0 6px 20px 0 rgba(30, 41, 59, 0.6)' 
                      : '0 4px 14px 0 rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9375rem',
                    lineHeight: 1.7
                  }}
                >
                  {msg.text}
                </Typography>
                
                {msg.sources && msg.sources.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #1f1f1f' }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600, 
                        display: 'block', 
                        mb: 1,
                        color: '#3b82f6',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '0.65rem'
                      }}
                    >
                      📎 Sources
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      {msg.sources.map((s: Source, idx: number) => (
                        <Chip 
                          key={idx} 
                          label={s.filename} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.75rem',
                            height: 26,
                            bgcolor: 'rgba(59, 130, 246, 0.15)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            fontWeight: 500,
                            transition: 'all 0.3s ease',
                            '& .MuiChip-label': { px: 1.5 },
                            '&:hover': {
                              bgcolor: 'rgba(59, 130, 246, 0.25)',
                              borderColor: '#3b82f6',
                              transform: 'scale(1.05)'
                            }
                          }} 
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>

              {msg.role === 'user' && (
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: '#1e293b',
                  border: '2px solid #334155',
                  color: '#fff'
                }}>
                  <UserIcon sx={{ fontSize: 20 }} />
                </Avatar>
              )}
            </Box>
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', gap: 2, animation: 'slideIn 0.4s ease' }}>
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
              }}>
                <RobotIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  bgcolor: '#111111',
                  borderRadius: 3,
                  border: '1px solid #1f1f1f'
                }}
              >
                <CircularProgress size={20} sx={{ color: '#3b82f6' }} />
              </Paper>
            </Box>
          )}
        </Box>

        {/* INPUT BAR */}
        <Box sx={{ 
          p: 3, 
          bgcolor: '#111111', 
          borderTop: '1px solid #1f1f1f'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            maxWidth: 1000,
            margin: '0 auto'
          }}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Ask me anything..." 
              variant="outlined"
              value={input} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
              disabled={loading}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  bgcolor: '#1a1a1a',
                  borderRadius: 3,
                  fontSize: '0.9375rem',
                  color: '#fff',
                  transition: 'all 0.3s ease',
                  '& fieldset': { borderColor: '#2a2a2a' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#3b82f6', 
                    borderWidth: '2px',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  },
                  '& input::placeholder, & textarea::placeholder': { 
                    color: '#555',
                    opacity: 1
                  }
                }
              }}
            />
            
            <IconButton 
              disabled={!input.trim() || loading} 
              onClick={handleSend}
              sx={{ 
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
                  : '#1a1a1a',
                color: '#fff',
                width: 48,
                height: 48,
                boxShadow: input.trim() && !loading
                  ? '0 4px 14px 0 rgba(59, 130, 246, 0.4)' 
                  : 'none',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' 
                    : '#1a1a1a',
                  transform: input.trim() && !loading ? 'scale(1.05)' : 'none',
                  boxShadow: input.trim() && !loading
                    ? '0 6px 20px 0 rgba(59, 130, 246, 0.6)' 
                    : 'none'
                },
                '&:disabled': {
                  background: '#1a1a1a',
                  color: '#333'
                }
              }}
            >
              <SendIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              textAlign: 'center',
              color: '#555',
              mt: 2,
              fontSize: '0.75rem'
            }}
          >
            AI can make mistakes. Verify important information.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}