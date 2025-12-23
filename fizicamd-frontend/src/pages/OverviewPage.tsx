import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { useI18n } from "../i18n";
import { useAuthStore } from "../store/authStore";
import { fetchMetricsHistory, openMetricsSocket } from "../api/metrics";
import type { ServerMetricSample } from "../types/admin";

const HISTORY_LIMIT = 120;

function formatBytes(bytes?: number | null) {
  if (bytes === null || bytes === undefined) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  if (values.length < 2) {
    return (
      <Box height={60} display="flex" alignItems="center" justifyContent="center" color="text.secondary">
        —
      </Box>
    );
  }
  const width = 240;
  const height = 60;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <Box component="svg" viewBox={`0 0 ${width} ${height}`} width="100%" height={60}>
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  );
}

export default function OverviewPage() {
  const { t } = useI18n();
  const { user, token } = useAuthStore();
  const [history, setHistory] = useState<ServerMetricSample[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    let active = true;
    fetchMetricsHistory(token, HISTORY_LIMIT)
      .then((items) => {
        if (active) setHistory(items);
      })
      .catch((err) => console.error(err));

    const socket = openMetricsSocket(token);
    socket.onopen = () => {
      if (active) setLive(true);
    };
    socket.onclose = () => {
      if (active) setLive(false);
    };
    socket.onmessage = (event) => {
      try {
        const sample = JSON.parse(event.data) as ServerMetricSample;
        setHistory((prev) => {
          const next = [...prev, sample];
          if (next.length > HISTORY_LIMIT) {
            next.shift();
          }
          return next;
        });
      } catch (err) {
        console.error(err);
      }
    };
    return () => {
      active = false;
      socket.close();
    };
  }, [token, user?.role]);

  const latest = history[history.length - 1];

  const heapRatio = latest?.heapMaxBytes ? latest.heapUsedBytes / latest.heapMaxBytes : null;
  const ramRatio = latest?.systemMemoryTotalBytes
    ? latest.systemMemoryUsedBytes / latest.systemMemoryTotalBytes
    : null;
  const cpuRatio = latest?.systemCpuLoad ?? null;
  const diskRatio = latest?.diskTotalBytes ? latest.diskUsedBytes / latest.diskTotalBytes : null;

  const heapSeries = useMemo(
    () => history.map((item) => item.heapMaxBytes ? item.heapUsedBytes / item.heapMaxBytes : 0),
    [history]
  );
  const ramSeries = useMemo(
    () => history.map((item) => item.systemMemoryTotalBytes ? item.systemMemoryUsedBytes / item.systemMemoryTotalBytes : 0),
    [history]
  );
  const cpuSeries = useMemo(
    () => history.map((item) => item.systemCpuLoad ?? 0),
    [history]
  );
  const diskSeries = useMemo(
    () => history.map((item) => item.diskTotalBytes ? item.diskUsedBytes / item.diskTotalBytes : 0),
    [history]
  );

  return (
    <PageLayout>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
          <Typography variant="h4" fontWeight={700}>
            {t("overview.metrics.title")}
          </Typography>
          <Chip
            label={live ? t("overview.metrics.live") : t("overview.metrics.paused")}
            color={live ? "success" : "warning"}
            size="small"
          />
        </Stack>

        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {t("overview.metrics.jvmMemory")}
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {formatPercent(heapRatio)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatBytes(latest?.heapUsedBytes)} / {formatBytes(latest?.heapMaxBytes)}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {t("overview.metrics.systemRam")}
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {formatPercent(ramRatio)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatBytes(latest?.systemMemoryUsedBytes)} / {formatBytes(latest?.systemMemoryTotalBytes)}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {t("overview.metrics.cpuUsage")}
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {formatPercent(cpuRatio)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("overview.metrics.load")}: {cpuRatio === null ? "—" : cpuRatio.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("overview.metrics.process")}:{" "}
                {latest?.processCpuLoad === null || latest?.processCpuLoad === undefined
                  ? "—"
                  : `${(latest.processCpuLoad * 100).toFixed(1)}%`}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {t("overview.metrics.diskUsage")}
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {formatPercent(diskRatio)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatBytes(latest?.diskUsedBytes)} / {formatBytes(latest?.diskTotalBytes)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {t("overview.metrics.historyHeap")}
              </Typography>
              <Sparkline values={heapSeries} stroke="#6366f1" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {t("overview.metrics.historyRam")}
              </Typography>
              <Sparkline values={ramSeries} stroke="#14b8a6" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {t("overview.metrics.historyCpu")}
              </Typography>
              <Sparkline values={cpuSeries} stroke="#f97316" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {t("overview.metrics.historyDisk")}
              </Typography>
              <Sparkline values={diskSeries} stroke="#22c55e" />
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </PageLayout>
  );
}
