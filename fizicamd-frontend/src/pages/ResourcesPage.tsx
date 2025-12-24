import { Fragment, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, ListSubheader, MenuItem, Pagination, Stack, TextField, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useI18n } from "../i18n";
import type { ResourceCard, ResourceCategory } from "../types/resources";
import { fetchPublicResourcesPage, fetchResourceCategories } from "../api/resources";
import ResourceCardComponent from "../components/resources/ResourceCard";

export default function ResourcesPage() {
  const { t } = useI18n();
  const [resources, setResources] = useState<ResourceCard[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get("category") ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(() => {
    const value = Number(searchParams.get("page"));
    return Number.isFinite(value) && value > 0 ? value : 1;
  });
  const [totalResources, setTotalResources] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    const nextCategory = searchParams.get("category") ?? "";
    setCategoryFilter(nextCategory);
    const nextPage = Number(searchParams.get("page"));
    setPage(Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1);
  }, [searchParams]);

  useEffect(() => {
    fetchResourceCategories()
      .then(setCategories)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPublicResourcesPage({
          category: categoryFilter || undefined,
          limit: pageSize,
          page,
        });
        setResources(data.items);
        setTotalResources(data.total);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryFilter, page]);

  const groupedCategories = useMemo(() => {
    const map = new Map<string, { order: number; items: ResourceCategory[] }>();
    categories.forEach((cat) => {
      if (!map.has(cat.group)) {
        map.set(cat.group, { order: cat.groupOrder ?? 0, items: [] });
      }
      map.get(cat.group)!.items.push(cat);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].order - b[1].order);
  }, [categories]);

  const menuItems = useMemo(() => {
    const items: React.ReactNode[] = [
      <MenuItem key="all" value="" onClick={() => setMenuOpen(false)}>
        {t("resources.allCategories")}
      </MenuItem>,
    ];
    groupedCategories.forEach(([group, data]) => {
      items.push(
        <ListSubheader key={`group-${group}`} disableSticky>
          {group}
        </ListSubheader>
      );
      data.items.forEach((cat) => {
        items.push(
          <MenuItem key={cat.code} value={cat.code} onClick={() => setMenuOpen(false)}>
            {cat.label}
          </MenuItem>
        );
      });
    });
    return items;
  }, [groupedCategories, t]);

  return (
    <PageLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} mb={3}>
          {t("resources.listTitle")}
        </Typography>
        <TextField
          select
          label={t("resources.categoryFilter")}
          value={categoryFilter}
          onChange={(e) => {
            const value = e.target.value;
            const next = new URLSearchParams(searchParams);
            if (value) {
              next.set("category", value);
            } else {
              next.delete("category");
            }
            next.delete("page");
            setCategoryFilter(value);
            setPage(1);
            setSearchParams(next);
          }}
          SelectProps={{
            open: menuOpen,
            onOpen: () => setMenuOpen(true),
            onClose: () => setMenuOpen(false),
            MenuProps: {
              onClick: () => setMenuOpen(false),
            },
          }}
          sx={{ mb: 3, minWidth: 240 }}
        >
          {menuItems}
        </TextField>

          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Box display="grid" gap={3} gridTemplateColumns="1fr">
                {resources.map((res) => (
                  <ResourceCardComponent key={res.id} resource={res} />
                ))}
              </Box>
              {!resources.length && (
                <Typography color="text.secondary" mt={2}>
                  {t("resources.empty")}
                </Typography>
              )}
              {totalResources > pageSize && (
                <Stack alignItems="center" mt={3}>
                  <Pagination
                    count={Math.ceil(totalResources / pageSize)}
                    page={page}
                    onChange={(_, value) => {
                      const next = new URLSearchParams(searchParams);
                      next.set("page", String(value));
                      setPage(value);
                      setSearchParams(next);
                    }}
                    color="primary"
                  />
                </Stack>
              )}
            </>
          )}
      </Box>
    </PageLayout>
  );
}
