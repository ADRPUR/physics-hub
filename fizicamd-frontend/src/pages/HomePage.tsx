import { Alert, Box, Button, Card, CardContent, Pagination, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n";
import NavigationSidebar from "../components/NavigationSidebar";
import { fetchPublicResourcesPage } from "../api/resources";
import type { ResourceCard } from "../types/resources";
import ResourceCardComponent from "../components/resources/ResourceCard";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [resources, setResources] = useState<ResourceCard[]>([]);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResources, setTotalResources] = useState(0);
  const pageSize = 5;

  const heroStats = useMemo(
    () => [
      { label: "Profesori activi", value: "45+" },
      { label: "Resurse publicate", value: "120+" },
      { label: "Ani de arhivă", value: "17" },
    ],
    []
  );

  const featureCards = useMemo(
    () => [
      { key: "curriculum", accent: "#5B5CFF" },
      { key: "resources", accent: "#FF7F5C" },
      { key: "community", accent: "#8B5CF6" },
    ],
    []
  );

  useEffect(() => {
    const loadResources = async () => {
      setResourceError(null);
      setLoading(true);
      try {
        const data = await fetchPublicResourcesPage({ limit: pageSize, page });
        setResources(data.items);
        setTotalResources(data.total);
      } catch (err) {
        console.error(err);
        setResourceError(t("home.loadError"));
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, [t, page]);

  return (
    <Box>
      {!user && (
        <Card
          sx={{
            mb: 5,
            p: { xs: 3, md: 6 },
            borderRadius: 5,
            background: "linear-gradient(135deg,#5B5CFF,#8B5CF6)",
            color: "#fff",
            boxShadow: "0 30px 80px rgba(14,18,62,0.35)",
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
            <Box flex={1}>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {t("home.hero.title")}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }} mb={3}>
                {t("home.hero.description")}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button variant="contained" color="secondary" onClick={() => navigate("/register")}>
                  {t("home.hero.primaryCta")}
                </Button>
                <Button variant="outlined" color="inherit" onClick={() => navigate("/resources")}>
                  {t("home.hero.secondaryCta")}
                </Button>
              </Stack>
            </Box>
            <Stack direction={{ xs: "row", md: "column" }} spacing={2} flexWrap="wrap" justifyContent="center">
              {heroStats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    minWidth: 140,
                    textAlign: "center",
                    p: 2,
                    borderRadius: 4,
                    backgroundColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Card>
      )}

      {!user && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={5}>
          {featureCards.map((feature) => (
            <Card
              key={feature.key}
              sx={{
                flex: 1,
                borderRadius: 4,
                borderColor: `${feature.accent}22`,
                background: "rgba(255,255,255,0.95)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color={feature.accent}>
                  {t(`home.features.${feature.key}`)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(`home.features.${feature.key}Desc`)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Box
        display="grid"
        gap={5}
        gridTemplateColumns={{ xs: "1fr", lg: "minmax(0, 320px) minmax(0, 1fr)" }}
        alignItems="flex-start"
      >
        <Box sx={{ position: { lg: "sticky" }, top: 24 }}>
          <NavigationSidebar />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={2}>
            {t("home.resourcesSection.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {t("home.resourcesSection.subtitle")}
          </Typography>
          {resourceError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {resourceError}
            </Alert>
          )}
          <Stack spacing={3}>
            {resources.map((res) => (
              <ResourceCardComponent key={res.id} resource={res} />
            ))}
          </Stack>
          {!resources.length && !resourceError && (
            <Typography color="text.secondary" mt={2}>
              {t("resources.empty")}
            </Typography>
          )}
          {loading && (
            <Typography mt={3} color="text.secondary">
              {t("search.loading")}
            </Typography>
          )}
          {totalResources > pageSize && !loading && (
            <Stack alignItems="center" mt={3}>
              <Pagination
                count={Math.ceil(totalResources / pageSize)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
