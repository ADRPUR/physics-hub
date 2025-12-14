import { useState } from "react";
import { Card, Typography, TextField, Button, Box, Alert, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { useI18n } from "../i18n";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();
  const { t } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiLogin({ email: form.email, password: form.password });
      setAuth(res.user, res.accessToken, res.refreshToken);
      navigate("/overview", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || t("authErrors.server"));
      } else {
        setError(t("authErrors.unknown"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f4f6f8">
        <Card sx={{ p: 4, width: 360 }}>
          <Typography variant="h5" gutterBottom>{t("login.title")}</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
            <TextField
                label={t("login.email")}
                type="email"
                margin="normal"
                fullWidth
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoFocus
            />
            <TextField
                label={t("login.password")}
                type="password"
                margin="normal"
                fullWidth
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSubmit(e as any)}
            />
            <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
            >
              {loading ? t("login.submit") : t("login.submit")}
            </Button>
            <Box mt={2} textAlign="center">
              <Link component={RouterLink} to="/register" underline="hover">
                {t("login.registerPrompt")} {t("login.registerLink")}
              </Link>
            </Box>
          </Box>
        </Card>
      </Box>
  );
}
