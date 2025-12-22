import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";
import type { ResourceCard } from "../types/resources";
import { deleteResource as deleteTeacherResource, fetchTeacherResources } from "../api/resources";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Delete, Edit, Visibility } from "@mui/icons-material";

export default function AdminResourcesPage() {
  const { token } = useAuthStore();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ResourceCard | null>(null);
  const locale = language === "ro" ? "ro-RO" : "en-US";

  const loadResources = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchTeacherResources(token);
      setResources(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const filteredRows = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter((res) => {
      const text = `${res.title} ${res.summary} ${res.category?.label ?? ""} ${res.tags?.join(" ") ?? ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [filter, resources]);

  const handleEdit = useCallback(
    (resourceId: string) => {
      navigate(`/teacher/studio?resource=${resourceId}`);
    },
    [navigate]
  );

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    await deleteTeacherResource(token, deleteTarget.id);
    setDeleteTarget(null);
    loadResources();
  };

  const columns = useMemo<GridColDef<ResourceCard>[]>(
    () => [
      {
        field: "title",
        headerName: t("adminResources.columns.title"),
        flex: 1.8,
      },
      {
        field: "category",
        headerName: t("adminResources.columns.category"),
        flex: 1,
        valueGetter: (_, row) => row.category?.label ?? "-",
      },
      {
        field: "status",
        headerName: t("adminResources.columns.status"),
        width: 140,
        renderCell: (params) => (
          <Chip
            size="small"
            color={params.row.status === "PUBLISHED" ? "success" : "warning"}
            label={
              params.row.status === "PUBLISHED"
                ? t("teacher.statusLabels.published")
                : t("teacher.statusLabels.draft")
            }
          />
        ),
      },
      {
        field: "authorName",
        headerName: t("adminResources.columns.author"),
        flex: 0.7,
      },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        width: 120,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => handleEdit(params.row.id)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(params.row)}>
              <Delete fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              component={RouterLink}
              to={`/resources/${params.row.slug}`}
              state={{ from: "/admin/resources" }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [t, locale, handleEdit]
  );

  return (
    <PageLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} mb={2}>
          {t("adminResources.title")}
        </Typography>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              mb={2}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                placeholder={t("adminResources.searchPlaceholder")}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                fullWidth
                size="small"
              />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={loadResources}>
                  {t("adminResources.refresh")}
                </Button>
                <Button variant="contained" onClick={() => navigate("/teacher/studio")}>
                  {t("adminResources.addResource")}
                </Button>
              </Stack>
            </Stack>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={loading}
              autoHeight
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              sx={{
                background: "transparent",
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "rgba(91,92,255,0.12)",
                  borderBottom: "1px solid rgba(91,92,255,0.15)",
                  color: "text.primary",
                },
                "& .MuiDataGrid-cell": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "& .MuiDataGrid-row": {
                  backgroundColor: "rgba(255,255,255,0.35)",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "rgba(91,92,255,0.08)",
                  borderTop: "1px solid rgba(91,92,255,0.15)",
                },
              }}
            />
          </CardContent>
        </Card>

        <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
          <DialogTitle>{t("adminResources.deleteTitle")}</DialogTitle>
          <DialogContent>
            {t("adminResources.deleteConfirm")} <strong>{deleteTarget?.title}</strong>?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTarget(null)}>{t("common.actions.cancel")}</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>
              {t("common.actions.delete")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageLayout>
  );
}
