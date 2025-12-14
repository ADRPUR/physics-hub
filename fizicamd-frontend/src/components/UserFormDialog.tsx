import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { UserListItem, UserUpsertPayload } from "../types/admin";
import type { RoleCode } from "../types/user";
import { useI18n } from "../i18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: UserUpsertPayload) => Promise<void>;
  mode: "create" | "edit";
  initial?: UserListItem | null;
};

const roleOptions: RoleCode[] = ["ADMIN", "TEACHER", "STUDENT"];

export default function UserFormDialog({ open, onClose, onSubmit, mode, initial }: Props) {
  const [form, setForm] = useState<UserUpsertPayload>({
    email: "",
    password: "",
    roles: ["STUDENT"],
    firstName: "",
    lastName: "",
    phone: "",
    school: "",
    gradeLevel: "",
    status: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setForm({
        email: initial.email,
        password: "",
        roles: initial.roles ?? [initial.primaryRole],
        firstName: initial.firstName ?? "",
        lastName: initial.lastName ?? "",
        phone: initial.phone ?? "",
        school: initial.school ?? "",
        gradeLevel: initial.gradeLevel ?? "",
        status: initial.status,
      });
    } else {
      setForm({
        email: "",
        password: "",
        roles: ["STUDENT"],
        firstName: "",
        lastName: "",
        phone: "",
        school: "",
        gradeLevel: "",
        status: "ACTIVE",
      });
    }
  }, [open, mode, initial]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload: UserUpsertPayload = {
        ...form,
        password: mode === "create" ? form.password : undefined,
      };
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: RoleCode) => {
    setForm((prev) => {
      const hasRole = prev.roles.includes(role);
      return {
        ...prev,
        roles: hasRole ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
      };
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth keepMounted>
      <DialogTitle>{mode === "create" ? t("adminUsers.dialog.addTitle") : t("adminUsers.dialog.editTitle")}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label={t("login.email")}
            type="email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />

          {mode === "create" && (
            <TextField
              label={t("adminUsers.dialog.tempPassword")}
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {roleOptions.map((role) => (
              <Chip
                key={role}
                label={t(`common.roles.${role}`)}
                clickable
                variant={form.roles.includes(role) ? "filled" : "outlined"}
                color={form.roles.includes(role) ? "primary" : "default"}
                onClick={() => toggleRole(role)}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
                label={t("register.firstName")}
              fullWidth
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
            />
            <TextField
                label={t("register.lastName")}
              fullWidth
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("register.phone")}
              fullWidth
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
              <TextField
                label={t("register.school")}
              fullWidth
              value={form.school}
              onChange={(e) => setForm((prev) => ({ ...prev, school: e.target.value }))}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("register.grade")}
              fullWidth
              value={form.gradeLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, gradeLevel: e.target.value }))}
            />
              <TextField
                label={t("adminUsers.dialog.status")}
                select
              fullWidth
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value as "ACTIVE" | "PENDING" | "DISABLED" }))
              }
            >
              <MenuItem value="ACTIVE">{t("common.status.active")}</MenuItem>
              <MenuItem value="PENDING">{t("common.status.pending")}</MenuItem>
              <MenuItem value="DISABLED">{t("common.status.disabled")}</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.actions.cancel")}</Button>
        <Button onClick={handleSubmit} disabled={saving} variant="contained">
          {saving ? t("common.actions.save") : t("common.actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
