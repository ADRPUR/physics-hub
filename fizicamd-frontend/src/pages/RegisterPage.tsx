// src/pages/RegisterPage.tsx
import { useState } from "react";
import {
  Card, Typography, TextField, Button, Box, Alert, Stack, Link,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { register as apiRegister, login as apiLogin } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n";

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  birthDate: string;
  phone: string;
  school: string;
  gradeLevel: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    birthDate: "",
    phone: "",
    school: "",
    gradeLevel: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();
  const { t } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError(t("register.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await apiRegister({
        email: form.email,
        password: form.password,
        confirmPassword: form.confirm,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        birthDate: form.birthDate,
        school: form.school,
        gradeLevel: form.gradeLevel,
      });

      const res = await apiLogin({ email: form.email, password: form.password });
      setAuth(res.user, res.accessToken, res.refreshToken);
      navigate("/overview", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || t("authErrors.registrationFailed"));
      } else {
        setError(t("authErrors.unknown"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f4f6f8">
        <Card sx={{ p: 4, width: 420, maxWidth: "90vw" }}>
          <Typography variant="h5" gutterBottom>{t("register.title")}</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                  label={t("register.firstName")}
                  fullWidth
                  required
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  autoFocus
              />
              <TextField
                  label={t("register.lastName")}
                  fullWidth
                  required
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              />
            </Stack>

            <TextField
                label={t("login.email")}
                type="email"
                margin="normal"
                fullWidth
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <TextField
                label={t("login.password")}
                type="password"
                margin="normal"
                fullWidth
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
            <TextField
                label={t("register.confirmPassword")}
                type="password"
                margin="normal"
                fullWidth
                required
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <TextField
                label={t("register.birthDate")}
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.birthDate}
                onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
              />
              <TextField
                label={t("register.phone")}
                fullWidth
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <TextField
                label={t("register.school")}
                fullWidth
                value={form.school}
                onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
              />
              <TextField
                label={t("register.grade")}
                fullWidth
                value={form.gradeLevel}
                onChange={(e) => setForm((f) => ({ ...f, gradeLevel: e.target.value }))}
              />
            </Stack>

            <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
            >
              {loading ? t("register.submit") : t("register.submit")}
            </Button>

            <Box mt={2} textAlign="center">
              <Link component={RouterLink} to="/login" underline="hover">
                {t("register.loginPrompt")} {t("register.loginLink")}
              </Link>
            </Box>
          </Box>
        </Card>
      </Box>
  );
}
