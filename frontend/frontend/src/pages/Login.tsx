import { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Link, Alert } from "@mui/material";
import { LockOutlined as LockIcon, PersonOutline as PersonIcon } from "@mui/icons-material";

export default function Login({ onLogin, onShowRegister }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.access) {
        localStorage.setItem("token", data.access);
        onLogin();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Connection error");
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: '#0a0a0a',
      background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.15), transparent 50%), radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.15), transparent 50%)'
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 5, 
          width: 440, 
          bgcolor: '#111111',
          border: '1px solid #1f1f1f',
          borderRadius: 3,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#2a2a2a',
            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.6)'
          }
        }}
      >
        {/* Logo/Icon */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 3 
        }}>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px 0 rgba(59, 130, 246, 0.4)',
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-8px)' }
            }
          }}>
            <LockIcon sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            fontWeight: 700,
            color: '#fff',
            mb: 1
          }}
        >
          Welcome Back
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center',
            color: '#888',
            mb: 4
          }}
        >
          Sign in to continue to your dashboard
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              '& .MuiAlert-icon': {
                color: '#ef4444'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <TextField 
          fullWidth 
          label="Email" 
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && login()}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#1a1a1a',
              borderRadius: 2,
              color: '#fff',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: '#2a2a2a'
              },
              '&:hover fieldset': {
                borderColor: '#3b82f6'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }
            },
            '& .MuiInputLabel-root': {
              color: '#888',
              '&.Mui-focused': {
                color: '#3b82f6'
              }
            }
          }}
        />
        
        <TextField 
          fullWidth 
          label="Password" 
          type="password" 
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && login()}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#1a1a1a',
              borderRadius: 2,
              color: '#fff',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: '#2a2a2a'
              },
              '&:hover fieldset': {
                borderColor: '#3b82f6'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }
            },
            '& .MuiInputLabel-root': {
              color: '#888',
              '&.Mui-focused': {
                color: '#3b82f6'
              }
            }
          }}
        />

        <Button 
          fullWidth 
          variant="contained" 
          sx={{ 
            mt: 4,
            mb: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: 2,
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.6)',
              transform: 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(0px)'
            }
          }} 
          onClick={login}
        >
          Sign In
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#888' }}>
            Don't have an account?{" "}
            <Link 
              component="button" 
              onClick={onShowRegister}
              sx={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#2563eb',
                  textDecoration: 'underline'
                }
              }}
            >
              Create one
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}