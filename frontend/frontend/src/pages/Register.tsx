import { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Link, Alert } from "@mui/material";
import { PersonAddOutlined as PersonAddIcon } from "@mui/icons-material";

export default function Register({ onRegisterSuccess, onShowLogin }: any) {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          onRegisterSuccess();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed. Try again.");
      }
    } catch (err) {
      setError("Server error. Is the backend running?");
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
            <PersonAddIcon sx={{ fontSize: 32, color: '#fff' }} />
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
          Create Account
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center',
            color: '#888',
            mb: 4
          }}
        >
          Join us and start your journey today
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

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              '& .MuiAlert-icon': {
                color: '#10b981'
              }
            }}
          >
            Registration successful! Redirecting to login...
          </Alert>
        )}
        
        <TextField 
          fullWidth 
          label="Username" 
          margin="normal"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
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
          label="Email" 
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
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
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
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
          disabled={success}
          sx={{ 
            mt: 4,
            mb: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            background: success 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: 2,
            boxShadow: success
              ? '0 4px 14px 0 rgba(16, 185, 129, 0.4)'
              : '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: success
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              boxShadow: success
                ? '0 4px 14px 0 rgba(16, 185, 129, 0.4)'
                : '0 6px 20px 0 rgba(59, 130, 246, 0.6)',
              transform: success ? 'none' : 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(0px)'
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              opacity: 1
            }
          }} 
          onClick={handleRegister}
        >
          {success ? '✓ Registration Successful' : 'Create Account'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#888' }}>
            Already have an account?{" "}
            <Link 
              component="button" 
              onClick={onShowLogin}
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
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}