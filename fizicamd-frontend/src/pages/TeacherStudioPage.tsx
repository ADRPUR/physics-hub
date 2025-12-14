import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import type { ArticleDraft, EventDraft } from "../types/content";
import { createArticle, createEvent, fetchArticles, fetchEvents } from "../api/content";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";

const emptyArticle: ArticleDraft = {
  title: "",
  summary: "",
  tags: [],
  visibility: "PUBLIC",
  body: "",
};

const emptyEvent: EventDraft = {
  name: "",
  description: "",
  location: "",
  startAt: "",
  visibility: "STUDENT",
};

export default function TeacherStudioPage() {
  const { token } = useAuthStore();
  const { t } = useI18n();
  const [article, setArticle] = useState<ArticleDraft>(emptyArticle);
  const [eventDraft, setEventDraft] = useState<EventDraft>(emptyEvent);
  const [articles, setArticles] = useState<ArticleDraft[]>([]);
  const [events, setEvents] = useState<EventDraft[]>([]);

  const loadData = async () => {
    if (!token) return;
    const [a, e] = await Promise.all([fetchArticles(token), fetchEvents(token)]);
    setArticles(a.items);
    setEvents(e.items);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleArticleSubmit = async () => {
    if (!token) return;
    await createArticle(token, {
      ...article,
      tags: article.tags.filter(Boolean),
    });
    setArticle(emptyArticle);
    loadData();
  };

  const handleEventSubmit = async () => {
    if (!token) return;
    await createEvent(token, eventDraft);
    setEventDraft(emptyEvent);
    loadData();
  };

  return (
    <PageLayout>
      <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {t("teacher.title")}
      </Typography>

      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
      >
        <Card>
          <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("teacher.createArticle")}
              </Typography>
            <Stack spacing={2}>
              <TextField
                  label={t("teacher.articleFields.title")}
                value={article.title}
                onChange={(e) => setArticle((prev) => ({ ...prev, title: e.target.value }))}
                fullWidth
              />
              <TextField
                  label={t("teacher.articleFields.summary")}
                value={article.summary}
                onChange={(e) => setArticle((prev) => ({ ...prev, summary: e.target.value }))}
                multiline
                minRows={2}
                fullWidth
              />
              <TextField
                  label={t("teacher.articleFields.body")}
                value={article.body}
                onChange={(e) => setArticle((prev) => ({ ...prev, body: e.target.value }))}
                multiline
                minRows={4}
                fullWidth
              />
              <TextField
                  label={t("teacher.articleFields.tags")}
                value={article.tags.join(", ")}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                  }))
                }
                fullWidth
              />
              <TextField
                  label={t("teacher.articleFields.visibility")}
                select
                value={article.visibility}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    visibility: e.target.value as ArticleDraft["visibility"],
                  }))
                }
                SelectProps={{ native: true }}
              >
                  <option value="PUBLIC">{t("common.visibility.PUBLIC")}</option>
                  <option value="STUDENT">{t("common.visibility.STUDENT")}</option>
                  <option value="TEACHER">{t("common.visibility.TEACHER")}</option>
                </TextField>
                <Button variant="contained" onClick={handleArticleSubmit}>
                  {t("teacher.publishArticle")}
                </Button>
              </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("teacher.createEvent")}
              </Typography>
            <Stack spacing={2}>
              <TextField
                  label={t("teacher.eventFields.name")}
                value={eventDraft.name}
                onChange={(e) => setEventDraft((prev) => ({ ...prev, name: e.target.value }))}
                fullWidth
              />
              <TextField
                  label={t("teacher.eventFields.description")}
                value={eventDraft.description}
                onChange={(e) => setEventDraft((prev) => ({ ...prev, description: e.target.value }))}
                multiline
                minRows={3}
              />
              <TextField
                  label={t("teacher.eventFields.location")}
                value={eventDraft.location}
                onChange={(e) => setEventDraft((prev) => ({ ...prev, location: e.target.value }))}
              />
              <TextField
                  label={t("teacher.eventFields.start")}
                type="datetime-local"
                value={eventDraft.startAt}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setEventDraft((prev) => ({ ...prev, startAt: e.target.value }))}
              />
              <TextField
                  label={t("teacher.eventFields.end")}
                type="datetime-local"
                value={eventDraft.endAt ?? ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setEventDraft((prev) => ({ ...prev, endAt: e.target.value }))}
              />
                <Button variant="contained" onClick={handleEventSubmit}>
                  {t("teacher.publishEvent")}
                </Button>
              </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box
        mt={3}
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
        alignItems="flex-start"
      >
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("teacher.recentArticles")}
            </Typography>
            <Stack spacing={1}>
              {articles.map((a) => (
                <Stack key={a.id ?? a.title} direction="row" spacing={1} alignItems="center">
                  <Box flex={1}>
                    <Typography fontWeight={600}>{a.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.summary}
                    </Typography>
                  </Box>
                    <Chip size="small" label={t(`common.visibility.${a.visibility}`)} />
                  </Stack>
                ))}
                {articles.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t("teacher.emptyArticles")}
                  </Typography>
                )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("teacher.upcomingEvents")}
            </Typography>
            <Stack spacing={1}>
              {events.map((ev) => (
                <Stack key={ev.id ?? ev.name} direction="row" spacing={1} alignItems="center">
                  <Box flex={1}>
                    <Typography fontWeight={600}>{ev.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ev.location} • {new Date(ev.startAt).toLocaleString()}
                    </Typography>
                  </Box>
                    <Chip size="small" label={t(`common.visibility.${ev.visibility}`)} variant="outlined" />
                  </Stack>
                ))}
                {events.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t("teacher.emptyEvents")}
                  </Typography>
                )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
    </PageLayout>
  );
}
