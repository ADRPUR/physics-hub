import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { createNavigationItem, deleteNavigationItem, fetchNavigation } from "../api/navigation";
import type { NavigationItem, NavigationUpsertPayload } from "../types/navigation";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";

const defaultPayload: NavigationUpsertPayload = {
  parentId: null,
  title: "",
  slug: "",
  type: "LINK",
  href: "",
  visibility: "PUBLIC",
  status: "PUBLISHED",
  sortOrder: 0,
  icon: "",
};

export default function AdminNavigationPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [payload, setPayload] = useState<NavigationUpsertPayload>(defaultPayload);
  const { t } = useI18n();

  const loadItems = async () => {
    if (!token) return;
    const res = await fetchNavigation(token);
    setItems(res.items);
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async () => {
    if (!token) return;
    await createNavigationItem(token, payload);
    setPayload(defaultPayload);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await deleteNavigationItem(token, id);
    loadItems();
  };

  return (
    <PageLayout>
      <Box>
      <Typography variant="h4" fontWeight={700} mb={2}>
        {t("adminNavigation.title")}
      </Typography>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="flex-start">
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("adminNavigation.addTitle")}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label={t("adminNavigation.fields.title")}
                value={payload.title}
                onChange={(e) => setPayload((prev) => ({ ...prev, title: e.target.value }))}
                fullWidth
              />
              <TextField
                label={t("adminNavigation.fields.slug")}
                value={payload.slug}
                onChange={(e) => setPayload((prev) => ({ ...prev, slug: e.target.value }))}
                helperText={t("adminNavigation.fields.slugHelp")}
                fullWidth
              />
              <TextField
                label={t("adminNavigation.fields.externalLink")}
                value={payload.href ?? ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, href: e.target.value }))}
                fullWidth
              />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label={t("adminNavigation.fields.type")}
                  select
                  fullWidth
                  value={payload.type}
                  onChange={(e) =>
                    setPayload((prev) => ({ ...prev, type: e.target.value as NavigationUpsertPayload["type"] }))
                  }
                >
                  <MenuItem value="LINK">{t("common.navigationTypes.LINK")}</MenuItem>
                  <MenuItem value="PAGE">{t("common.navigationTypes.PAGE")}</MenuItem>
                  <MenuItem value="SECTION">{t("common.navigationTypes.SECTION")}</MenuItem>
                </TextField>
                <TextField
                  label={t("adminNavigation.fields.visibility")}
                  select
                  fullWidth
                  value={payload.visibility}
                  onChange={(e) =>
                    setPayload((prev) => ({
                      ...prev,
                      visibility: e.target.value as NavigationUpsertPayload["visibility"],
                    }))
                  }
                >
                  <MenuItem value="PUBLIC">{t("common.visibility.PUBLIC")}</MenuItem>
                  <MenuItem value="STUDENT">{t("common.visibility.STUDENT")}</MenuItem>
                  <MenuItem value="TEACHER">{t("common.visibility.TEACHER")}</MenuItem>
                  <MenuItem value="ADMIN">{t("common.visibility.ADMIN")}</MenuItem>
                </TextField>
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label={t("adminNavigation.fields.order")}
                  type="number"
                  value={payload.sortOrder ?? 0}
                  onChange={(e) =>
                    setPayload((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))
                  }
                  fullWidth
                />
                <TextField
                  label={t("adminNavigation.fields.icon")}
                  value={payload.icon ?? ""}
                  onChange={(e) => setPayload((prev) => ({ ...prev, icon: e.target.value }))}
                  fullWidth
                />
              </Stack>
              <Button variant="contained" onClick={handleCreate}>
                {t("adminNavigation.addButton")}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("adminNavigation.existingTitle")}
            </Typography>
            <Stack divider={<Divider flexItem />} spacing={1}>
              {(items?.length ?? 0) === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t("common.table.noData")}
                </Typography>
              )}
              {(items ?? []).map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ py: 1 }}
                >
                  <Box>
                    <Typography fontWeight={600}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      /{item.slug}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={t(`common.navigationTypes.${item.type}`)} />
                    <Chip size="small" label={t(`common.visibility.${item.visibility}`)} variant="outlined" />
                    <IconButton color="error" size="small" onClick={() => handleDelete(item.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
    </PageLayout>
  );
}
