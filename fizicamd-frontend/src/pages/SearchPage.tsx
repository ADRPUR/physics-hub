import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchContent } from "../api/public";
import type { SearchResult } from "../types/public";
import { useI18n } from "../i18n";

export default function SearchPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qParam = params.get("q") ?? "";
  const [term, setTerm] = useState(qParam);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTerm(qParam);
    if (qParam.trim()) {
      runSearch(qParam);
    } else {
      setResults([]);
    }
  }, [qParam]);

  const runSearch = async (raw: string) => {
    const value = raw.trim();
    if (!value) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchContent(value);
      setResults(res.items);
    } catch (err) {
      console.error(err);
      setError(t("search.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = term.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  const resolveLink = (item: SearchResult) => {
    if (item.href) return item.href;
    return `/resources/${item.slug}`;
  };

  const handleOpen = (item: SearchResult) => {
    const link = resolveLink(item);
    if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      navigate(link);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        {t("search.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        {t("search.subtitle")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} mb={3}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label={t("search.input")}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained">
            {t("home.searchAction")}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <CircularProgress size={20} />
          <Typography>{t("search.loading")}</Typography>
        </Stack>
      )}

      <Stack spacing={2}>
        {results.map((item) => (
          <Card key={item.id} variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {item.type}
              </Typography>
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.slug}
              </Typography>
              <Button sx={{ mt: 1 }} onClick={() => handleOpen(item)}>
                {t("home.sections.view")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {!loading && results.length === 0 && (
        <Typography color="text.secondary" mt={3}>
          {qParam.trim() ? t("search.noResults") : t("search.start")}
        </Typography>
      )}
    </Box>
  );
}
