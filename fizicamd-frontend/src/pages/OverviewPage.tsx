import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useAuthStore } from "../store/authStore";
import dayjs from "dayjs";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";

export default function OverviewPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const { t } = useI18n();

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
        <Box>
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
        </Box>

        <Box>
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
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {t("overview.shortCuts")}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary={t("overview.fillProfile")} secondary={t("overview.fillProfileDesc")} />
                </ListItem>
                {role === "ADMIN" && (
                  <ListItem>
                    <ListItemText
                      primary={t("overview.configureMenu")}
                      secondary={t("overview.configureMenuDesc")}
                    />
                  </ListItem>
                )}
                {role !== "ADMIN" && (
                  <ListItem>
                    <ListItemText
                      primary={t("overview.viewGroups")}
                      secondary={t("overview.viewGroupsDesc")}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
      </Box>
    </PageLayout>
  );
}
