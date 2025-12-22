import { Card, CardContent, CardMedia, Chip, Stack, Typography, Button, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import type { ResourceCard as ResourceCardType } from "../../types/resources";
import { useI18n } from "../../i18n";
import { absoluteMediaUrl } from "../../utils/media";
import { formatHumanDate } from "../../utils/dates";

interface Props {
  resource: ResourceCardType;
}

export default function ResourceCard({ resource }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useI18n();

  const cover = absoluteMediaUrl(resource.avatarUrl);
  const locale = language === "ro" ? "ro-RO" : "en-US";
  const publishedAt = formatHumanDate(resource.publishedAt, locale);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        display: "flex",
        flexDirection: cover ? "row" : "column",
        width: "100%",
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(91,92,255,0.08), rgba(255,126,92,0.08))",
        border: "1px solid rgba(91,92,255,0.12)",
      }}
    >
      {cover && (
        <Box sx={{ width: { xs: 150, sm: 220 }, flexShrink: 0 }}>
          <CardMedia
            component="img"
            image={cover}
            alt={resource.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              minHeight: 160,
            }}
          />
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
          {resource.category?.group && (
            <Chip label={resource.category.group} size="small" color="secondary" />
          )}
          <Chip label={resource.category?.label} size="small" />
        </Stack>
        <Typography variant="h6" gutterBottom>
          {resource.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {resource.summary}
        </Typography>
        {resource.tags?.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
            {resource.tags.map((tag) => (
              <Chip key={tag} size="small" label={tag} variant="outlined" />
            ))}
          </Stack>
        ) : null}
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          {t("resources.publishedBy")}: {resource.authorName}
          {publishedAt ? ` ${t("resources.publishedOn")} ${publishedAt}` : ""}
        </Typography>
        <Button
          size="small"
          sx={{ mt: "auto", alignSelf: "flex-start" }}
          onClick={() =>
            navigate(`/resources/${resource.slug}`, {
              state: { from: `${location.pathname}${location.search}` },
            })
          }
        >
          {t("resources.viewDetails")}
        </Button>
      </CardContent>
    </Card>
  );
}
