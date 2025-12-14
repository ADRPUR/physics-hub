import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationTree } from "../contexts/navigationContext";
import { useI18n } from "../i18n";
import { useAuthStore } from "../store/authStore";
import NavigationSidebar from "../components/NavigationSidebar";
import { fetchHomepageContent } from "../api/public";
import type { HomepageContent } from "../types/public";

const fallbackFeatureKeys = [
  { titleKey: "home.features.curriculum", descriptionKey: "home.features.curriculumDesc" },
  { titleKey: "home.features.resources", descriptionKey: "home.features.resourcesDesc" },
  { titleKey: "home.features.community", descriptionKey: "home.features.communityDesc" },
];

export default function HomePage() {
  const { tree } = useNavigationTree();
  const { t } = useI18n();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homeContent, setHomeContent] = useState<HomepageContent | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      try {
        const data = await fetchHomepageContent();
        setHomeContent({
          hero: data.hero ?? null,
          features: data.features ?? [],
          spotlights: data.spotlights ?? [],
        });
      } catch (err) {
        console.error(err);
        setError(t("home.loadError"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const heroTitle = homeContent?.hero?.title ?? t("home.hero.title");
  const heroSubtitle = homeContent?.hero?.subtitle ?? t("home.hero.subtitle");
  const heroDescription = homeContent?.hero?.description ?? t("home.hero.description");
  const heroPrimary = homeContent?.hero?.primaryCta;
  const heroSecondary = homeContent?.hero?.secondaryCta;
  const heroImage = homeContent?.hero?.media?.image ?? "/hero-bg.svg";

  const features = useMemo(() => {
    if (homeContent?.features?.length) {
      return homeContent.features;
    }
    return fallbackFeatureKeys.map((card, idx) => ({
      id: `fallback-${idx}`,
      title: t(card.titleKey),
      subtitle: null,
      description: t(card.descriptionKey),
      icon: null,
      cta: null,
    }));
  }, [homeContent?.features, t]);

  const spotlights = useMemo(() => {
    if (homeContent?.spotlights?.length) {
      return homeContent.spotlights;
    }
    return tree.slice(0, 3).map((node, idx) => ({
      id: `spotlight-${idx}`,
      title: node.title,
      description: node.children.length ? `${node.children.length} ${t("home.sections.resources")}` : node.slug,
      badge: "Nav",
      navigationSlug: node.slug,
      link: `/resources/${node.slug}`,
    }));
  }, [homeContent?.spotlights, tree, t]);

  const onSearch = () => {
    const query = search.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handlePrimaryCta = () => {
    const link = heroPrimary?.link || (token ? "/overview" : "/register");
    navigate(link);
  };

  const handleSecondaryCta = () => {
    if (heroSecondary?.link) {
      navigate(heroSecondary.link);
    } else {
      navigate("/login");
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          mb: 4,
          backgroundImage: `url('${heroImage}')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "white",
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "minmax(0, 1fr) minmax(0, 360px)" }}
          gap={4}
          alignItems="center"
        >
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {heroTitle}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {heroSubtitle}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {heroDescription}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
              <Button variant="contained" size="large" onClick={handlePrimaryCta}>
                {heroPrimary?.label ?? t("home.hero.primaryCta")}
              </Button>
              <Button variant="outlined" size="large" onClick={handleSecondaryCta}>
                {heroSecondary?.label ?? t("home.hero.secondaryCta")}
              </Button>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
              <TextField
                placeholder={t("home.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                fullWidth
                InputProps={{
                  sx: {
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 2,
                    color: "white",
                  },
                }}
                InputLabelProps={{
                  sx: { color: "rgba(255,255,255,0.7)" },
                }}
              />
              <Button variant="contained" color="secondary" onClick={onSearch}>
                {t("home.searchAction")}
              </Button>
            </Stack>
          </Box>
          <Box>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("home.hero.teaser")}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Physics Hub
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("home.hero.description")}
                </Typography>
                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                  <Chip label={t("common.roles.STUDENT")} color="primary" variant="outlined" />
                  <Chip label={t("common.roles.TEACHER")} color="secondary" variant="outlined" />
                  <Chip label="STEM" />
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Box
        display="grid"
        gap={4}
        gridTemplateColumns={{ xs: "1fr", lg: "minmax(0, 320px) minmax(0, 1fr)" }}
        alignItems="flex-start"
      >
        <Box>
          <NavigationSidebar />
        </Box>
        <Box>
          <Box
            display="grid"
            gap={3}
            gridTemplateColumns={{ xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }}
          >
            {features.map((card) => (
              <Card key={card.id} sx={{ borderRadius: 3 }} elevation={0} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{card.title}</Typography>
                  {card.subtitle && (
                    <Typography variant="body2" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  )}
                  {card.description && (
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  )}
                  {card.cta?.link && (
                    <Button size="small" sx={{ mt: 2 }} onClick={() => navigate(card.cta!.link!)}>
                      {card.cta?.label ?? t("home.sections.view")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box mt={4}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {t("home.sections.spotlights")}
            </Typography>
            <Box
              display="grid"
              gap={3}
              gridTemplateColumns={{ xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
            >
              {spotlights.map((spot) => (
                <Card key={spot.id} variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent>
                    {spot.badge && (
                      <Chip label={spot.badge} size="small" sx={{ mb: 1 }} color="secondary" variant="outlined" />
                    )}
                    <Typography variant="h6">{spot.title}</Typography>
                    {spot.description && (
                      <Typography variant="body2" color="text.secondary">
                        {spot.description}
                      </Typography>
                    )}
                    <Button
                      sx={{ mt: 2 }}
                      onClick={() => {
                        if (spot.link) {
                          if (spot.link.startsWith("http")) {
                            window.open(spot.link, "_blank");
                          } else {
                            navigate(spot.link);
                          }
                        } else if (spot.navigationSlug) {
                          navigate(`/resources/${spot.navigationSlug}`);
                        }
                      }}
                    >
                      {t("home.sections.view")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          <Box mt={4}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {t("home.sections.structure")}
            </Typography>
            <Box
              display="grid"
              gap={3}
              gridTemplateColumns={{ xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
            >
              {tree.slice(0, 6).map((node) => (
                <Card key={node.id} variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {node.children.length} {t("home.sections.resources")}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {node.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {node.slug}
                    </Typography>
                    <Button sx={{ mt: 2 }} onClick={() => navigate(`/resources/${node.slug}`)}>
                      {t("home.sections.view")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {tree.length === 0 && (
                <Box>
                  <Typography color="text.secondary">{t("home.noNavigation")}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      {loading && (
        <Typography mt={3} color="text.secondary">
          {t("search.loading")}
        </Typography>
      )}
    </Box>
  );
}
