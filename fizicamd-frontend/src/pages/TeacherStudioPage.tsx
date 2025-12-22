import {
  Alert,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
} from "@mui/material";
import { useAuthStore } from "../store/authStore";
import { useEffect, useMemo, useState, useCallback, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";
import type {
  ResourceBlockInput,
  ResourceCategory,
  ResourceStatus,
} from "../types/resources";
import {
  createResource as createTeacherResource,
  fetchResourceCategories,
  uploadResourceAsset,
  fetchTeacherResourceDetail,
  updateResource as updateTeacherResource,
} from "../api/resources";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { absoluteMediaUrl } from "../utils/media";
import { useSearchParams } from "react-router-dom";
import TeX from "@matejmazur/react-katex";
import { addStyles, EditableMathField } from "react-mathquill";

addStyles();

type ResourceDraft = {
  categoryGroup: string;
  categoryCode: string;
  title: string;
  summary: string;
  avatarAssetId?: string;
  avatarUrl?: string;
  tags: string[];
  blocks: ResourceBlockInput[];
  status: ResourceStatus;
};

const createEmptyResource = (): ResourceDraft => ({
  categoryGroup: "",
  categoryCode: "",
  title: "",
  summary: "",
  tags: [],
  blocks: [],
  status: "PUBLISHED",
});

export default function TeacherStudioPage() {
  const { token } = useAuthStore();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resourceDraft, setResourceDraft] = useState<ResourceDraft>(createEmptyResource());
  const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([]);
  const [savingResource, setSavingResource] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

  useEffect(() => {
    fetchResourceCategories()
      .then(setResourceCategories)
      .catch((err) => console.error(err));
  }, []);

  const groupedCategoryOptions = useMemo(() => {
    const map = new Map<string, { order: number; items: ResourceCategory[] }>();
    resourceCategories.forEach((cat) => {
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
  }, [resourceCategories]);

  const subcategoryOptions = useMemo(
    () =>
      resourceCategories
        .filter((cat) => cat.group === resourceDraft.categoryGroup)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [resourceCategories, resourceDraft.categoryGroup]
  );

  const handleGroupChange = useCallback(
    (group: string, preferredCode?: string) => {
      setResourceDraft((prev) => {
        const options = resourceCategories
          .filter((cat) => cat.group === group)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        const fallback = options[0]?.code ?? "";
        const nextCode =
          preferredCode && options.some((c) => c.code === preferredCode) ? preferredCode : fallback;
        return {
          ...prev,
          categoryGroup: group,
          categoryCode: nextCode,
        };
      });
    },
    [resourceCategories]
  );

  useEffect(() => {
    if (!resourceCategories.length) return;
    if (!resourceDraft.categoryGroup) {
      const fallbackGroup = groupedCategoryOptions[0]?.group;
      if (fallbackGroup) {
        handleGroupChange(fallbackGroup);
      }
      return;
    }
    const options = resourceCategories.filter((cat) => cat.group === resourceDraft.categoryGroup);
    if (!options.length) {
      const fallbackGroup = groupedCategoryOptions[0]?.group;
      if (fallbackGroup) {
        handleGroupChange(fallbackGroup);
      }
      return;
    }
    if (!options.some((cat) => cat.code === resourceDraft.categoryCode)) {
      handleGroupChange(resourceDraft.categoryGroup);
    }
  }, [
    resourceCategories,
    groupedCategoryOptions,
    resourceDraft.categoryGroup,
    resourceDraft.categoryCode,
    handleGroupChange,
  ]);

  const handleResourceSubmit = async (nextStatus: ResourceStatus) => {
    if (!token) return;
    if (!resourceDraft.categoryCode) return;
    setSavingResource(true);
    const payload = {
      categoryCode: resourceDraft.categoryCode,
      title: resourceDraft.title,
      summary: resourceDraft.summary,
      avatarAssetId: resourceDraft.avatarAssetId,
      tags: resourceDraft.tags.filter((tag) => !!tag),
      blocks: resourceDraft.blocks.map(({ mediaUrl, ...rest }) => rest),
      status: nextStatus,
    };
    try {
      if (editingResourceId) {
        await updateTeacherResource(token, editingResourceId, payload);
      } else {
        await createTeacherResource(token, payload);
      }
      resetResourceForm(resourceDraft.categoryGroup, resourceDraft.categoryCode);
      clearEditingQuery();
    } finally {
      setSavingResource(false);
    }
  };

  const handleResourceField = (field: keyof ResourceDraft, value: string) => {
    setResourceDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddBlock = (type: ResourceBlockInput["type"]) => {
    setResourceDraft((prev) => ({
      ...prev,
      blocks: [
        ...prev.blocks,
        {
          type,
          text: type === "TEXT" || type === "FORMULA" ? "" : undefined,
          title: type === "LINK" ? "" : undefined,
          url: type === "LINK" ? "" : undefined,
        },
      ],
    }));
  };

  const handleBlockChange = (index: number, data: Partial<ResourceBlockInput>) => {
    setResourceDraft((prev) => {
      const next = [...prev.blocks];
      next[index] = { ...next[index], ...data };
      return { ...prev, blocks: next };
    });
  };

  const handleBlockDelete = (index: number) => {
    setResourceDraft((prev) => {
      const next = [...prev.blocks];
      next.splice(index, 1);
      return { ...prev, blocks: next };
    });
  };

  const resetResourceForm = useCallback(
    (group?: string, code?: string) => {
      const fallbackGroup =
        group ??
        groupedCategoryOptions[0]?.group ??
        resourceCategories[0]?.group ??
        "";
      const fallbackOptions = resourceCategories
        .filter((cat) => cat.group === fallbackGroup)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const fallbackCode = code ?? fallbackOptions[0]?.code ?? "";
      setResourceDraft({
        ...createEmptyResource(),
        categoryGroup: fallbackGroup,
        categoryCode: fallbackCode,
      });
      setTagInput("");
      setEditingResourceId(null);
    },
    [groupedCategoryOptions, resourceCategories]
  );

  const addTag = (value: string) => {
    const next = value.trim();
    if (!next) return;
    setResourceDraft((prev) => {
      if (prev.tags.includes(next)) return prev;
      return { ...prev, tags: [...prev.tags, next] };
    });
    setTagInput("");
  };

  const handleTagInputKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value;
      addTag(value);
    }
  };

  const handleTagDelete = (tag: string) => {
    setResourceDraft((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleAvatarUpload = async (file?: File | null) => {
    if (!token || !file) return;
    const res = await uploadResourceAsset(token, file);
    setResourceDraft((prev) => ({ ...prev, avatarAssetId: res.assetId, avatarUrl: res.url }));
  };

  const handleBlockUpload = async (index: number, file?: File | null) => {
    if (!token || !file) return;
    const res = await uploadResourceAsset(token, file);
    handleBlockChange(index, { assetId: res.assetId, mediaUrl: res.url });
  };

  const handleEditResource = useCallback(
    async (resourceId: string) => {
      if (!token) return;
      try {
        const detail = await fetchTeacherResourceDetail(token, resourceId);
        setEditingResourceId(resourceId);
        setTagInput("");
        setResourceDraft({
          categoryGroup: detail.category?.group ?? "",
          categoryCode: detail.category?.code ?? "",
          title: detail.title,
          summary: detail.summary,
          avatarAssetId: detail.avatarAssetId ?? undefined,
          avatarUrl: detail.avatarUrl ?? undefined,
          tags: detail.tags ?? [],
          status: detail.status ?? "PUBLISHED",
          blocks:
            detail.blocks?.map((block) => ({
              type: block.type,
              text: block.text ?? undefined,
              url: block.url ?? undefined,
              assetId: block.assetId ?? undefined,
              mediaUrl: block.mediaUrl ?? undefined,
              caption: block.caption ?? undefined,
              title: block.title ?? undefined,
            })) ?? [],
        });
      } catch (err) {
        console.error("Failed to load resource", err);
      }
    },
    [token]
  );

  const clearEditingQuery = useCallback(() => {
    if (!searchParams.has("resource")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("resource");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const editingParam = searchParams.get("resource");
  useEffect(() => {
    if (editingParam && editingParam !== editingResourceId) {
      void handleEditResource(editingParam);
    }
  }, [editingParam, editingResourceId, handleEditResource]);

  const handleCancelEdit = () => {
    resetResourceForm(resourceDraft.categoryGroup, resourceDraft.categoryCode);
    clearEditingQuery();
  };

  return (
    <PageLayout sidebarEditable>
      <Box>
        <Typography variant="h4" fontWeight={700} mb={3}>
          {t("teacher.title")}
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("teacher.createResource")}
            </Typography>
            {editingResourceId && (
              <Alert
                severity="info"
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={handleCancelEdit}>
                    {t("common.actions.cancel")}
                  </Button>
                }
              >
                {t("teacher.editingResource")}
                <Chip
                  size="small"
                  color={resourceDraft.status === "DRAFT" ? "warning" : "success"}
                  label={
                    resourceDraft.status === "DRAFT"
                      ? t("teacher.statusLabels.draft")
                      : t("teacher.statusLabels.published")
                  }
                  sx={{ ml: 2 }}
                />
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                select
                label={t("teacher.resourceFields.category")}
                value={resourceDraft.categoryGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
              >
                {groupedCategoryOptions.length === 0 && (
                  <MenuItem value="">{t("resources.allCategories")}</MenuItem>
                )}
                {groupedCategoryOptions.map((group) => (
                  <MenuItem key={group.group} value={group.group}>
                    {group.group}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={t("teacher.resourceFields.subcategory")}
                value={resourceDraft.categoryCode}
                onChange={(e) => handleResourceField("categoryCode", e.target.value)}
                disabled={!subcategoryOptions.length}
              >
                {subcategoryOptions.length === 0 && (
                  <MenuItem value="">{t("resources.allCategories")}</MenuItem>
                )}
                {subcategoryOptions.map((cat) => (
                  <MenuItem key={cat.code} value={cat.code}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label={t("teacher.resourceFields.title")}
                value={resourceDraft.title}
                onChange={(e) => handleResourceField("title", e.target.value)}
              />
              <TextField
                label={t("teacher.resourceFields.summary")}
                value={resourceDraft.summary}
                onChange={(e) => handleResourceField("summary", e.target.value)}
                multiline
                minRows={3}
              />
              <TextField
                label={t("teacher.resourceFields.tags")}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKey}
                helperText={t("teacher.resourceFields.tagsHelp")}
              />
              {resourceDraft.tags.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {resourceDraft.tags.map((tag) => (
                    <Chip key={tag} label={tag} onDelete={() => handleTagDelete(tag)} />
                  ))}
                </Stack>
              )}
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                {t("teacher.resourceFields.avatar")}
                <input type="file" hidden accept="image/*" onChange={(e) => handleAvatarUpload(e.target.files?.[0])} />
              </Button>
              {resourceDraft.avatarUrl && (
                <Box
                  component="img"
                  src={absoluteMediaUrl(resourceDraft.avatarUrl)}
                  alt="avatar preview"
                  sx={{ maxWidth: 200, borderRadius: 2 }}
                />
              )}
              <Divider />
              <Typography variant="subtitle1">{t("teacher.resourceFields.blocks")}</Typography>
              <Stack spacing={2}>
                {resourceDraft.blocks.map((block, index) => (
                  <Card key={`${block.type}-${index}`} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography fontWeight={600}>{block.type}</Typography>
                        <IconButton size="small" onClick={() => handleBlockDelete(index)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      {block.type === "TEXT" && (
                        <TextField
                          multiline
                          minRows={3}
                          value={block.text ?? ""}
                          onChange={(e) => handleBlockChange(index, { text: e.target.value })}
                          fullWidth
                        />
                      )}
                      {block.type === "LINK" && (
                        <Stack spacing={2}>
                          <TextField
                            label="Titlu"
                            value={block.title ?? ""}
                            onChange={(e) => handleBlockChange(index, { title: e.target.value })}
                          />
                          <TextField
                            label="URL"
                            value={block.url ?? ""}
                            onChange={(e) => handleBlockChange(index, { url: e.target.value })}
                          />
                        </Stack>
                      )}
                      {block.type === "FORMULA" && (
                        <Stack spacing={2}>
                          <EditableMathField
                            latex={block.text ?? ""}
                            onChange={(mf) => handleBlockChange(index, { text: mf.latex() })}
                            style={{
                              minHeight: 60,
                              border: "1px solid rgba(91,92,255,0.3)",
                              borderRadius: 12,
                              padding: "12px 16px",
                              backgroundColor: "rgba(255,255,255,0.6)",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {t("teacher.blocks.formulaHint")}
                          </Typography>
                          {block.text ? (
                            <Box
                              sx={{
                                borderRadius: 2,
                                border: "1px dashed rgba(91,92,255,0.4)",
                                p: 2,
                                backgroundColor: "rgba(91,92,255,0.05)",
                              }}
                            >
                              <TeX block math={block.text} />
                            </Box>
                          ) : null}
                        </Stack>
                      )}
                      {(block.type === "IMAGE" || block.type === "PDF") && (
                        <Stack spacing={1}>
                          <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                            {block.type === "PDF" ? "PDF" : "Imagine"}
                            <input
                              type="file"
                              hidden
                              accept={block.type === "PDF" ? "application/pdf" : "image/*"}
                              onChange={(e) => handleBlockUpload(index, e.target.files?.[0])}
                            />
                          </Button>
                          {block.mediaUrl && block.type === "IMAGE" && (
                            <Box
                              component="img"
                              src={absoluteMediaUrl(block.mediaUrl)}
                              alt={block.caption ?? ""}
                              sx={{ maxWidth: 200, borderRadius: 2 }}
                            />
                          )}
                          {block.mediaUrl && block.type === "PDF" && (
                            <Button
                              size="small"
                              component="a"
                              href={absoluteMediaUrl(block.mediaUrl)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t("resources.downloadPdf")}
                            </Button>
                          )}
                          <TextField
                            label="Descriere"
                            value={block.caption ?? ""}
                            onChange={(e) => handleBlockChange(index, { caption: e.target.value })}
                          />
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!resourceDraft.blocks.length && (
                  <Typography color="text.secondary">{t("teacher.blocks.empty")}</Typography>
                )}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="outlined" onClick={() => handleAddBlock("TEXT")}>
                  {t("teacher.blocks.addText")}
                </Button>
                <Button variant="outlined" onClick={() => handleAddBlock("LINK")}>
                  {t("teacher.blocks.addLink")}
                </Button>
                <Button variant="outlined" onClick={() => handleAddBlock("IMAGE")}>
                  {t("teacher.blocks.addImage")}
                </Button>
                <Button variant="outlined" onClick={() => handleAddBlock("PDF")}>
                  {t("teacher.blocks.addPdf")}
                </Button>
                <Button variant="outlined" onClick={() => handleAddBlock("FORMULA")}>
                  {t("teacher.blocks.addFormula")}
                </Button>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                {editingResourceId && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleCancelEdit}
                    disabled={savingResource}
                  >
                    {t("common.actions.cancel")}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => handleResourceSubmit("DRAFT")}
                  disabled={savingResource}
                >
                  {t("teacher.saveDraft")}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleResourceSubmit("PUBLISHED")}
                  disabled={savingResource}
                >
                  {t("teacher.publishResource")}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

    </Box>
    </PageLayout>
  );
}
