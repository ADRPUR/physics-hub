import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit, ArrowUpward, ArrowDownward, Save } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createResourceCategory,
  deleteResourceCategory,
  fetchResourceCategories,
  updateResourceCategory,
  updateResourceCategoryGroup,
} from "../api/resources";
import type { ResourceCategory } from "../types/resources";
import { useAuthStore } from "../store/authStore";
import { AxiosError } from "axios";
import { notify } from "../utils/notifications";

type CategoryDialogState = {
  mode: "create" | "edit";
  category?: ResourceCategory;
  values: {
    label: string;
    group: string;
  };
  error?: string | null;
};

type GroupDialogState = {
  group: string;
  label: string;
  groupOrder: string;
  error?: string | null;
} | null;

function parseNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function errorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && (err as AxiosError)?.isAxiosError) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    return axiosErr.response?.data?.message ?? fallback;
  }
  return fallback;
}

export default function NavigationSidebar({ editable = false }: { editable?: boolean }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [orderedGroups, setOrderedGroups] = useState<
    { group: string; order: number; items: ResourceCategory[] }[]
  >([]);
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialogState | null>(null);
  const [groupDialog, setGroupDialog] = useState<GroupDialogState>(null);
  const [deleteDialog, setDeleteDialog] = useState<ResourceCategory | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);

  const loadCategories = useCallback(() => {
    fetchResourceCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to load resource categories", err));
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleDeleteCategory = async (category: ResourceCategory) => {
    if (!token) return;
    try {
      await deleteResourceCategory(token, category.code);
      loadCategories();
      notify({ message: t("teacher.sidebarManager.saveSuccess"), severity: "success" });
    } catch (err) {
      notify({
        message: errorMessage(err, t("teacher.sidebarManager.deleteBlocked")),
        severity: "error",
      });
    }
  };

  const groupedCategories = useMemo(() => {
    const map = new Map<string, { order: number; items: ResourceCategory[] }>();
    categories.forEach((cat) => {
      if (!map.has(cat.group)) {
        map.set(cat.group, { order: cat.groupOrder ?? 0, items: [] });
      }
      map.get(cat.group)!.items.push(cat);
    });
    return Array.from(map.entries())
      .map(([group, data]) => ({
        group,
        order: data.order,
        items: data.items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      }))
      .sort((a, b) => a.order - b.order);
  }, [categories]);

  useEffect(() => {
    setOrderedGroups(groupedCategories);
    setOrderDirty(false);
  }, [groupedCategories]);

  const visibleGroups = editable ? orderedGroups : groupedCategories;

  const moveGroup = (index: number, direction: -1 | 1) => {
    setOrderedGroups((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
    setOrderDirty(true);
  };

  const moveCategory = (groupIndex: number, itemIndex: number, direction: -1 | 1) => {
    setOrderedGroups((prev) => {
      const next = [...prev];
      const group = next[groupIndex];
      if (!group) return prev;
      const items = [...group.items];
      const nextIndex = itemIndex + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return prev;
      const [moved] = items.splice(itemIndex, 1);
      items.splice(nextIndex, 0, moved);
      next[groupIndex] = { ...group, items };
      return next;
    });
    setOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    if (!token) return;
    setSavingOrder(true);
    try {
      await Promise.all(
        orderedGroups.map((group, groupIndex) =>
          updateResourceCategoryGroup(token, group.group, {
            label: group.group,
            groupOrder: groupIndex + 1,
          })
        )
      );

      const updates = orderedGroups.flatMap((group, groupIndex) =>
        group.items.map((cat, itemIndex) =>
          updateResourceCategory(token, cat.code, {
            label: cat.label,
            group: cat.group,
            sortOrder: itemIndex + 1,
            groupOrder: groupIndex + 1,
          })
        )
      );

      await Promise.all(updates);
      loadCategories();
      notify({ message: t("teacher.sidebarManager.saveSuccess"), severity: "success" });
    } catch (err) {
      notify({
        message: errorMessage(err, t("teacher.sidebarManager.saveError")),
        severity: "error",
      });
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 3,
        background: "linear-gradient(135deg, rgba(91,92,255,0.12), rgba(255,126,92,0.08))",
        borderColor: "rgba(91,92,255,0.15)",
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {t("home.sidebarTitle")}
        </Typography>
        <Stack spacing={2}>
      {visibleGroups.map((group, groupIndex) => (
        <div key={group.group}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="body1" fontWeight={600}>
              {group.group}
            </Typography>
            {editable && (
              <Stack direction="row" spacing={1}>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    disabled={groupIndex === 0 || savingOrder}
                    onClick={() => moveGroup(groupIndex, -1)}
                  >
                    <ArrowUpward fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={groupIndex === visibleGroups.length - 1 || savingOrder}
                    onClick={() => moveGroup(groupIndex, 1)}
                  >
                    <ArrowDownward fontSize="inherit" />
                  </IconButton>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() =>
                    setGroupDialog({
                      group: group.group,
                      label: group.group,
                      groupOrder: group.order ? String(group.order) : "",
                      error: null,
                    })
                  }
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() =>
                    setCategoryDialog({
                      mode: "create",
                      values: {
                        label: "",
                        group: group.group,
                      },
                    })
                  }
                >
                  <Add fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Stack>
          <List dense sx={{ mt: 1 }}>
            {group.items.map((cat, itemIndex) => (
              <Stack direction="row" alignItems="center" key={cat.code} spacing={1}>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    flex: 1,
                    "&:hover": {
                      backgroundColor: "rgba(91,92,255,0.08)",
                    },
                  }}
                  onClick={() => navigate(`/resources?category=${cat.code}`)}
                  disabled={editable && savingCategory}
                >
                  <ListItemText primary={cat.label} />
                </ListItemButton>
                {editable && (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      disabled={itemIndex === 0 || savingOrder}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCategory(groupIndex, itemIndex, -1);
                      }}
                    >
                      <ArrowUpward fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={itemIndex === group.items.length - 1 || savingOrder}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCategory(groupIndex, itemIndex, 1);
                      }}
                    >
                      <ArrowDownward fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryDialog({
                          mode: "edit",
                          category: cat,
                          values: {
                            label: cat.label,
                            group: cat.group,
                          },
                        });
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog(cat);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
            ))}
          </List>
        </div>
      ))}
      {groupedCategories.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {t("home.noNavigation")}
        </Typography>
      )}
      {editable && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() =>
            setCategoryDialog({
              mode: "create",
              values: { label: "", group: "" },
            })
          }
        >
          {t("teacher.sidebarManager.addCategory")}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Save />}
            disabled={!orderDirty || savingOrder}
            onClick={handleSaveOrder}
          >
            {t("teacher.sidebarManager.saveOrder")}
          </Button>
        </Stack>
      )}
    </Stack>
    <CategoryDialog
      open={!!categoryDialog}
      dialog={categoryDialog}
      saving={savingCategory}
      onClose={() => setCategoryDialog(null)}
      onChange={(field, value) =>
        setCategoryDialog((prev) =>
          prev
            ? {
                ...prev,
                values: {
                  ...prev.values,
                  [field]: value,
                },
                error: null,
              }
            : prev
        )
      }
      onSubmit={async () => {
        if (!categoryDialog || !token) return;
        setSavingCategory(true);
        setCategoryDialog((prev) => (prev ? { ...prev, error: null } : prev));
        const isEditing = categoryDialog.mode === "edit";
        const currentGroup = categoryDialog.category?.group ?? "";
        const nextGroup = categoryDialog.values.group.trim();
        const targetGroup = nextGroup || currentGroup;
        const groupOrderMap = new Map<string, number>();
        categories.forEach((cat) => {
          groupOrderMap.set(cat.group, cat.groupOrder ?? 0);
        });
        const maxGroupOrder = Math.max(0, ...Array.from(groupOrderMap.values()));
        const nextGroupOrder = targetGroup ? (groupOrderMap.get(targetGroup) ?? maxGroupOrder + 1) : undefined;
        const sortOrderForGroup = (groupName: string) => {
          const groupItems = categories.filter((cat) => cat.group === groupName);
          const maxSortOrder = Math.max(0, ...groupItems.map((cat) => cat.sortOrder ?? 0));
          return maxSortOrder + 1;
        };
        const payload = {
          label: categoryDialog.values.label,
          group: targetGroup,
          sortOrder:
            isEditing && categoryDialog.category?.group === targetGroup
              ? categoryDialog.category?.sortOrder
              : targetGroup
              ? sortOrderForGroup(targetGroup)
              : undefined,
          groupOrder:
            isEditing && categoryDialog.category?.group === targetGroup
              ? categoryDialog.category?.groupOrder
              : nextGroupOrder,
        };
        try {
          if (categoryDialog.mode === "create") {
            await createResourceCategory(token, payload);
          } else if (categoryDialog.category) {
            await updateResourceCategory(token, categoryDialog.category.code, payload);
          }
          setCategoryDialog(null);
          loadCategories();
          notify({ message: t("teacher.sidebarManager.saveSuccess"), severity: "success" });
        } catch (err) {
          const message = errorMessage(err, t("teacher.sidebarManager.saveError"));
          setCategoryDialog((prev) => (prev ? { ...prev, error: message } : prev));
          notify({ message, severity: "error" });
        } finally {
          setSavingCategory(false);
        }
      }}
      t={t}
    />
    <GroupDialog
      open={!!groupDialog && editable}
      dialog={groupDialog}
      saving={savingGroup}
      onClose={() => setGroupDialog(null)}
      onChange={(field, value) =>
        setGroupDialog((prev) => (prev ? { ...prev, [field]: value, error: null } : prev))
      }
      onSubmit={async () => {
        if (!groupDialog || !token) return;
        setSavingGroup(true);
        setGroupDialog((prev) => (prev ? { ...prev, error: null } : prev));
        try {
          await updateResourceCategoryGroup(token, groupDialog.group, {
            label: groupDialog.label,
            groupOrder: parseNumber(groupDialog.groupOrder),
          });
          setGroupDialog(null);
          loadCategories();
          notify({ message: t("teacher.sidebarManager.saveSuccess"), severity: "success" });
        } catch (err) {
          const message = errorMessage(err, t("teacher.sidebarManager.saveError"));
          setGroupDialog((prev) => (prev ? { ...prev, error: message } : prev));
          notify({ message, severity: "error" });
        } finally {
          setSavingGroup(false);
        }
      }}
      t={t}
    />
    <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
      <DialogTitle>{t("common.actions.delete")}</DialogTitle>
      <DialogContent>
        {t("teacher.sidebarManager.deleteConfirm")} <strong>{deleteDialog?.label}</strong>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialog(null)}>
          {t("common.actions.cancel")}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => {
            if (!deleteDialog) return;
            void handleDeleteCategory(deleteDialog);
            setDeleteDialog(null);
          }}
        >
          {t("common.actions.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  </CardContent>
</Card>
);
}

type CategoryDialogProps = {
  open: boolean;
  dialog: CategoryDialogState | null;
  saving: boolean;
  onClose: () => void;
  onChange: (field: keyof CategoryDialogState["values"], value: string) => void;
  onSubmit: () => void;
  t: ReturnType<typeof useI18n>["t"];
};

function CategoryDialog({ open, dialog, saving, onClose, onChange, onSubmit, t }: CategoryDialogProps) {
  if (!dialog) return null;
  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {dialog.mode === "create"
          ? t("teacher.sidebarManager.addCategoryTitle")
          : t("teacher.sidebarManager.editCategoryTitle")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {dialog.error && <Alert severity="error">{dialog.error}</Alert>}
          <TextField
            label={t("teacher.sidebarManager.fields.label")}
            value={dialog.values.label}
            onChange={(e) => onChange("label", e.target.value)}
            fullWidth
          />
          <TextField
            label={t("teacher.sidebarManager.fields.group")}
            value={dialog.values.group}
            onChange={(e) => onChange("group", e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t("common.actions.cancel")}
        </Button>
        <Button onClick={onSubmit} disabled={saving} variant="contained">
          {dialog.mode === "create" ? t("common.actions.add") : t("common.actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type GroupDialogProps = {
  open: boolean;
  dialog: GroupDialogState;
  saving: boolean;
  onClose: () => void;
  onChange: (field: "label", value: string) => void;
  onSubmit: () => void;
  t: ReturnType<typeof useI18n>["t"];
};

function GroupDialog({ open, dialog, saving, onClose, onChange, onSubmit, t }: GroupDialogProps) {
  if (!dialog) return null;
  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("teacher.sidebarManager.groupDialogTitle")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {dialog.error && <Alert severity="error">{dialog.error}</Alert>}
          <TextField
            label={t("teacher.sidebarManager.fields.group")}
            value={dialog.label}
            onChange={(e) => onChange("label", e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t("common.actions.cancel")}
        </Button>
        <Button onClick={onSubmit} disabled={saving} variant="contained">
          {t("common.actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
