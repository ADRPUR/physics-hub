import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useAuthStore } from "../store/authStore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";
import { fetchPublicResources } from "../api/resources";
import type { ResourceCard } from "../types/resources";

export default function OverviewPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const { t } = useI18n();
  const navigate = useNavigate();
  const [recentResources, setRecentResources] = useState<ResourceCard[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  const initials =
    `${user?.profile?.firstName?.[0] ?? ""}${user?.profile?.lastName?.[0] ?? ""}` ||
    user?.email?.[0] ||
    "?";

  const quickActions = useMemo(
    () => [
      { label: t("profile.title"), to: "/profile" },
      { label: t("resources.listTitle"), to: "/resources" },
      ...(role === "TEACHER" || role === "ADMIN" ? [{ label: t("layout.studio"), to: "/teacher/studio" }] : []),
      ...(role === "ADMIN" ? [{ label: t("layout.users"), to: "/admin/users" }] : []),
    ],
    [role, t]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingResources(true);
      try {
        const items = await fetchPublicResources({ limit: 5 });
        if (active) setRecentResources(items);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingResources(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} mb={3}>
          {t("overview.welcome")}, {user?.profile?.firstName || user?.email}
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
          gap={2}
        >
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {t("overview.activeRole")}
              </Typography>
              <Typography variant="h5" mt={1}>
                {role}
              </Typography>
              <Chip
                label={user?.status ? t(`common.status.${user.status.toLowerCase()}`) : ""}
                size="small"
                color={user?.status === "ACTIVE" ? "success" : "warning"}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {t("overview.lastLogin")}
              </Typography>
              <Typography variant="h5" mt={1}>
                {user?.lastLoginAt ? dayjs(user.lastLoginAt).format("DD MMM YYYY HH:mm") : "N/A"}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                  {initials.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("profile.accountCardTitle")}
                  </Typography>
                  <Typography variant="h6">
                    {user?.profile?.firstName || user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" }}
          gap={2}
          mt={2}
        >
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                {t("overview.shortCuts")}
              </Typography>
              <Stack spacing={1}>
                {quickActions.map((action) => (
                  <Button
                    key={action.to}
                    variant="outlined"
                    onClick={() => navigate(action.to)}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                {t("resources.latest")}
              </Typography>
              {loadingResources ? (
                <Typography color="text.secondary">{t("search.loading")}</Typography>
              ) : recentResources.length ? (
                <List dense disablePadding>
                  {recentResources.map((resource) => (
                    <ListItemButton
                      key={resource.id}
                      onClick={() => navigate(`/resources/${resource.slug}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemText
                        primary={resource.title}
                        secondary={resource.category?.label}
                      />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">{t("resources.empty")}</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </PageLayout>
  );
}
