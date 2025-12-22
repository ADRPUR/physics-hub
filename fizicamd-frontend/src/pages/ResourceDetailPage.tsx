import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import PageLayout from "../components/PageLayout";
import type { ResourceDetail } from "../types/resources";
import { fetchResourceDetail } from "../api/resources";
import ResourceContent from "../components/resources/ResourceContent";
import { useI18n } from "../i18n";
import { absoluteMediaUrl } from "../utils/media";
import { formatHumanDate } from "../utils/dates";

export default function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useI18n();
  const location = useLocation();
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await fetchResourceDetail(slug);
        setResource(data);
      } catch (err) {
        console.error(err);
        setError(t("resources.notFound"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, t]);

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error || !resource) {
    return (
      <PageLayout>
        <Alert severity="error">{error ?? t("resources.notFound")}</Alert>
      </PageLayout>
    );
  }

  const locale = language === "ro" ? "ro-RO" : "en-US";
  const publishedAt = formatHumanDate(resource.publishedAt, locale);
  const cover = absoluteMediaUrl(resource.avatarUrl);
  const from = typeof location.state?.from === "string" ? location.state.from : null;
  const backTarget = from ?? "/resources";
  const backLabel = from === "/"
    ? t("resources.backToHome")
    : from?.startsWith("/resources")
    ? t("resources.backToList")
    : t("common.actions.back");

  return (
    <PageLayout>
      <Button
        component={RouterLink}
        to={backTarget}
        startIcon={<ArrowBack />}
        sx={{ mb: 2 }}
      >
        {backLabel}
      </Button>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 3 }}>
        <Stack spacing={2}>
          {cover && (
            <Box
              component="img"
              src={cover}
              alt={resource.title}
              sx={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 2 }}
            />
          )}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {resource.category?.group && (
              <Chip label={resource.category.group} color="secondary" size="small" />
            )}
            <Chip label={resource.category?.label} size="small" />
          </Stack>
          <Typography variant="h4" fontWeight={700}>
            {resource.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {resource.summary}
          </Typography>
          {resource.tags?.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {resource.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" />
              ))}
            </Stack>
          ) : null}
          <Typography variant="subtitle2" color="text.secondary">
            {t("resources.publishedBy")}: {resource.authorName}
            {publishedAt ? ` ${t("resources.publishedOn")} ${publishedAt}` : ""}
          </Typography>
        </Stack>
      </Paper>
      <ResourceContent blocks={resource.blocks} />
    </PageLayout>
  );
}
