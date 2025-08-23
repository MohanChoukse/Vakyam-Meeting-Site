import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { LockOutlined, PersonAddOutlined } from "@mui/icons-material";
import "../App.css";

export default function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate("/home");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="authContainer">
      <div className="authBackground">
        <div className="authFormContainer">
          <Paper elevation={24} className="authPaper">
            <Box className="authHeader">
              <div className="authIcon">
                {isLogin ? <LockOutlined /> : <PersonAddOutlined />}
              </div>
              <Typography variant="h4" className="authTitle">
                {isLogin ? "Welcome Back" : "Create Account"}
              </Typography>
              <Typography variant="body1" className="authSubtitle">
                {isLogin
                  ? "Sign in to continue to your video calls"
                  : "Join us for amazing video calling experience"}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" className="authAlert">
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="authForm">
              {!isLogin && (
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  className="authInput"
                />
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="authInput"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="authInput"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="authSubmitButton"
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </Box>

            <Box className="authToggle">
              <Typography variant="body2">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <span
                  className="authToggleLink"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </span>
              </Typography>
            </Box>
          </Paper>
        </div>
      </div>
    </div>
  );
}
