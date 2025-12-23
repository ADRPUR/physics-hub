import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  MenuItem,
} from "@mui/material";
import { useAuthStore } from "../store/authStore";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { deleteMyAccount, fetchProfile, updateProfile, uploadAvatar } from "../api/user";
import type { ProfileUpdateRequest } from "../types/user";
import { API_URL } from "../api/http";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { getCroppedImage } from "../utils/cropImage";
import "react-easy-crop/react-easy-crop.css";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";
import { notify } from "../utils/notifications";

export default function ProfilePage() {
  const { user, token, updateUser, logout } = useAuthStore();
  const { t } = useI18n();
  const [form, setForm] = useState<ProfileUpdateRequest>({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    phone: "",
    school: "",
    gradeLevel: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canDeleteSelf = user && user.role !== "ADMIN";

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const profile = await fetchProfile(token);
        if (!active) return;
        const details = profile.user.profile ?? {};
        setForm({
          firstName: details.firstName ?? "",
          lastName: details.lastName ?? "",
          birthDate: details.birthDate ?? "",
          gender: details.gender ?? "",
          phone: details.phone ?? "",
          school: details.school ?? "",
          gradeLevel: details.gradeLevel ?? "",
          bio: details.bio ?? "",
        });
        updateUser(profile.user);
      } catch (err) {
        console.error(err);
        if (active) {
          notify({ message: t("profile.loadError"), severity: "error" });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [token, updateUser, t]);

  const handleChange =
    (field: keyof ProfileUpdateRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload: ProfileUpdateRequest = {
        ...form,
        birthDate: form.birthDate ? dayjs(form.birthDate).format("YYYY-MM-DD") : undefined,
      };
      const { user: updated } = await updateProfile(token, payload);
      updateUser(updated);
      notify({ message: t("profile.saveSuccess"), severity: "success" });
    } catch (err) {
      console.error(err);
      notify({ message: t("profile.saveError"), severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleCropComplete = (_: Area, area: Area) => {
    setCroppedAreaPixels(area);
  };

  const resetCropState = () => {
    setCropDialogOpen(false);
    setSelectedFile(null);
    setImageSrc(null);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropSave = async () => {
    if (!token || !selectedFile || !imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const croppedBlob = await getCroppedImage(imageSrc, croppedAreaPixels, selectedFile.type);
      const croppedFile = new File([croppedBlob], selectedFile.name, { type: selectedFile.type });
      await uploadAvatar(token, croppedFile);
      const profile = await fetchProfile(token);
      updateUser(profile.user);
      notify({ message: t("profile.avatarUpdated"), severity: "success" });
      resetCropState();
    } catch (err) {
      console.error(err);
      notify({ message: t("profile.avatarError"), severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token || !canDeleteSelf) return;
    if (!confirm(t("profile.deleteConfirm"))) return;
    try {
      await deleteMyAccount(token);
      logout();
    } catch (err) {
      console.error(err);
      notify({ message: t("profile.deleteError"), severity: "error" });
    }
  };

  const avatarSrc = useMemo(() => {
    if (!user?.profile?.avatarUrl) return undefined;
    return `${API_URL}${user.profile.avatarUrl}?t=${Date.now()}`;
  }, [user?.profile?.avatarUrl]);

  const avatarLetters = useMemo(() => {
    if (!user?.profile) return user?.email?.[0]?.toUpperCase() ?? "?";
    return `${user.profile.firstName?.[0] ?? ""}${user.profile.lastName?.[0] ?? ""}` || "?";
  }, [user]);

  return (
    <PageLayout>
      <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>
        {t("profile.title")}
      </Typography>

      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "minmax(0, 320px) minmax(0, 1fr)" }}
        alignItems="flex-start"
      >
        <Stack spacing={3}>
          <Card>
            <CardHeader title={t("profile.avatarCardTitle")} subheader={t("profile.avatarCardSubtitle")} />
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Avatar
                  src={avatarSrc}
                  sx={{ width: 128, height: 128, fontSize: 42 }}
                >
                  {avatarLetters}
                </Avatar>
                <Button variant="outlined" component="label" disabled={saving}>
                  {t("profile.changeAvatar")}
                  <input
                    hidden
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={t("profile.accountCardTitle")} subheader={t("profile.accountCardSubtitle")} />
            <CardContent>
              <InfoRow label={t("profile.labels.email")} value={user?.email} />
              <InfoRow label={t("profile.labels.role")} value={t(`common.roles.${user?.role ?? "STUDENT"}`)} />
              <InfoRow label={t("profile.labels.status")} value={t(`common.status.${(user?.status ?? "").toLowerCase()}`)} />
            </CardContent>
            {canDeleteSelf && (
              <>
                <Divider />
                <CardContent>
                  <Button color="error" variant="outlined" onClick={handleDeleteAccount}>
                    {t("profile.deleteAccount")}
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </Stack>

        <Card>
          <CardHeader
            title={t("profile.personalDataTitle")}
            subheader={t("profile.personalDataSubtitle")}
          />
          <CardContent>
            <Box
              display="grid"
              gap={2}
              gridTemplateColumns={{ xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
            >
              <TextField
                label={t("profile.labels.firstName")}
                value={form.firstName}
                onChange={handleChange("firstName")}
                fullWidth
                disabled={loading}
              />
              <TextField
                label={t("profile.labels.lastName")}
                value={form.lastName}
                onChange={handleChange("lastName")}
                fullWidth
                disabled={loading}
              />
              <TextField
                label={t("profile.labels.birthDate")}
                type="date"
                value={form.birthDate ?? ""}
                onChange={handleChange("birthDate")}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
              <TextField
                label={t("profile.labels.phone")}
                value={form.phone}
                onChange={handleChange("phone")}
                fullWidth
                disabled={loading}
              />
              <TextField
                label={t("profile.labels.school")}
                value={form.school}
                onChange={handleChange("school")}
                fullWidth
                disabled={loading}
              />
              <TextField
                label={t("profile.labels.grade")}
                value={form.gradeLevel}
                onChange={handleChange("gradeLevel")}
                fullWidth
                disabled={loading}
              />
              <TextField
                select
                label={t("profile.labels.gender")}
                value={form.gender ?? ""}
                onChange={handleChange("gender")}
                fullWidth
                disabled={loading}
              >
                <MenuItem value="">{t("profile.gender.unspecified")}</MenuItem>
                <MenuItem value="FEMALE">{t("profile.gender.female")}</MenuItem>
                <MenuItem value="MALE">{t("profile.gender.male")}</MenuItem>
                <MenuItem value="OTHER">{t("profile.gender.other")}</MenuItem>
              </TextField>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  label={t("profile.labels.bio")}
                  multiline
                  minRows={3}
                  value={form.bio}
                  onChange={handleChange("bio")}
                  fullWidth
                  disabled={loading}
                />
              </Box>
            </Box>
          </CardContent>
          <Divider />
          <CardContent>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
                {t("common.actions.save")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <Dialog open={cropDialogOpen} onClose={resetCropState} maxWidth="sm" fullWidth keepMounted>
        <DialogTitle>{t("profile.avatarDialogTitle")}</DialogTitle>
        <DialogContent
          sx={{
            minHeight: 320,
            position: "relative",
            backgroundColor: "#111",
          }}
        >
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              minZoom={0.4}
              maxZoom={4}
              cropShape="round"
              showGrid={false}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          )}
        </DialogContent>
        <Box px={4} py={2}>
          <Typography variant="body2" gutterBottom>
            {t("profile.zoomLabel")}
          </Typography>
          <Slider
            min={0.4}
            max={4}
            step={0.1}
            value={zoom}
            onChange={(_, value) => setZoom(value as number)}
          />
        </Box>
        <DialogActions>
          <Button onClick={resetCropState}>{t("common.actions.cancel")}</Button>
          <Button onClick={handleCropSave} variant="contained" disabled={saving}>
            {t("common.actions.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
    </PageLayout>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || "—"}
      </Typography>
    </Box>
  );
}
