import { useState } from "react";
import { Typography, TextField, Button, Box, Link, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { useI18n } from "../i18n";
import { notify } from "../utils/notifications";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();
  const { t } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin({ email: form.email, password: form.password });
      setAuth(res.user, res.accessToken, res.refreshToken);
      notify({ message: t("login.success"), severity: "success" });
      const nextRoute = res.user.role === "ADMIN" ? "/overview" : "/profile";
      navigate(nextRoute, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = err.response?.data?.message || err.response?.data?.error;
        notify({
          message:
            backendMessage === "Authentication failed"
              ? t("authErrors.invalidCredentials")
              : backendMessage || t("authErrors.server"),
          severity: "error",
        });
      } else {
        notify({ message: t("authErrors.unknown"), severity: "error" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(91,92,255,0.22), transparent 55%)," +
            "radial-gradient(circle at 85% 10%, rgba(255,126,92,0.18), transparent 55%)," +
            "linear-gradient(180deg, #F8F9FF 0%, #F2F3FF 100%)",
          px: { xs: 2, md: 4 },
          py: { xs: 6, md: 8 },
        }}
      >
        <Box
          sx={{
            width: "min(1040px, 100%)",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            gap: { xs: 3, md: 0 },
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(15, 23, 42, 0.18)",
            border: "1px solid rgba(255,255,255,0.65)",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(16px)",
          }}
        >
          <Box
            sx={{
              minHeight: { xs: 220, md: 520 },
              backgroundImage: "url(/hero-bg.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
              p: { xs: 3, md: 5 },
              color: "#fff",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(59,71,250,0.8), rgba(139,92,246,0.55) 55%, rgba(255,127,92,0.45))",
              }}
            />
            <Stack spacing={1.5} sx={{ position: "relative", maxWidth: 360 }}>
              <Typography variant="h4" fontWeight={700}>
                Physics Hub
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {t("home.hero.description")}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {t("home.hero.subtitle")}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "rgba(255,255,255,0.7)",
            }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {t("login.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {t("home.hero.teaser")}
            </Typography>
            <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label={t("login.email")}
                  type="email"
                  fullWidth
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoFocus
                />
                <TextField
                  label={t("login.password")}
                  type="password"
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
                  sx={{ py: 1.2, fontWeight: 600 }}
                  disabled={loading}
                >
                  {t("login.submit")}
                </Button>
                <Box textAlign="center">
                  <Link component={RouterLink} to="/register" underline="hover">
                    {t("login.registerPrompt")} {t("login.registerLink")}
                  </Link>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
  );
}
