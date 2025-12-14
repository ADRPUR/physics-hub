import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { listUsers, createUser, updateUser, deleteUser } from "../api/users";
import type { UserListItem, UserUpsertPayload } from "../types/admin";
import UserFormDialog from "../components/UserFormDialog";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";

export default function AdminUsersPage() {
  const { token } = useAuthStore();
  const { t } = useI18n();
  const [rows, setRows] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<UserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const columns = useMemo<GridColDef<UserListItem>[]>(
    () => [
      {
        field: "email",
        headerName: t("adminUsers.columns.user"),
        flex: 1.2,
        valueGetter: (_, row) => row.email,
      },
      {
        field: "primaryRole",
        headerName: t("adminUsers.columns.role"),
        width: 150,
        renderCell: (params) => (
          <Chip size="small" label={t(`common.roles.${params.value as string}`)} />
        ),
      },
      {
        field: "status",
        headerName: t("adminUsers.columns.status"),
        width: 130,
        renderCell: (params) => (
          <Chip
            size="small"
            label={t(`common.status.${(params.value as string).toLowerCase()}`)}
            color={params.value === "ACTIVE" ? "success" : params.value === "PENDING" ? "warning" : "default"}
          />
        ),
      },
      { field: "school", headerName: t("adminUsers.columns.school"), flex: 1 },
      { field: "gradeLevel", headerName: t("adminUsers.columns.grade"), width: 120 },
      {
        field: "actions",
        headerName: "",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              onClick={() => {
                setSelected(params.row);
                setDialogMode("edit");
                setDialogOpen(true);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setDeleteTarget(params.row);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [t]
  );

  const fetchData = async (resetPage = false) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await listUsers(token, {
        page: (resetPage ? 0 : page) + 1,
        pageSize,
        search: search || undefined,
      });
      setRows(res.items);
      setTotal(res.total);
      if (resetPage) setPage(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, pageSize]);

  useEffect(() => {
    const t = setTimeout(() => fetchData(true), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (payload: UserUpsertPayload) => {
    if (!token) return;
    if (dialogMode === "create") {
      await createUser(token, payload);
    } else if (selected) {
      await updateUser(token, selected.id, payload);
    }
    setDialogOpen(false);
    setSelected(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    await deleteUser(token, deleteTarget.id);
    setDeleteTarget(null);
    fetchData(true);
  };

  return (
    <PageLayout>
      <Box>
      <Typography variant="h4" fontWeight={700} mb={2}>
        {t("adminUsers.title")}
      </Typography>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            mb={2}
          >
            <TextField
              placeholder={t("adminUsers.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelected(null);
                setDialogMode("create");
                setDialogOpen(true);
              }}
            >
              {t("adminUsers.addUser")}
            </Button>
          </Stack>

          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={total}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            getRowId={(row) => row.id}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      <UserFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        initial={selected}
        onSubmit={handleSubmit}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>{t("common.actions.delete")}</DialogTitle>
        <DialogContent>
          {t("adminUsers.deleteConfirm")} <strong>{deleteTarget?.email}</strong>
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
