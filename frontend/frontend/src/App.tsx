import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const theme = createTheme({
  palette: {
    primary: { main: "#075e54" },
    background: { default: "#f0f2f5" },
  },
});

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);

  if (loggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dashboard />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showRegister ? (
        <Register 
          onRegisterSuccess={() => setShowRegister(false)} 
          onShowLogin={() => setShowRegister(false)} 
        />
      ) : (
        <Login 
          onLogin={() => setLoggedIn(true)} 
          onShowRegister={() => setShowRegister(true)} 
        />
      )}
    </ThemeProvider>
  );
}