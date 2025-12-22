import { Fragment, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, ListSubheader, MenuItem, TextField, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useI18n } from "../i18n";
import type { ResourceCard, ResourceCategory } from "../types/resources";
import { fetchPublicResources, fetchResourceCategories } from "../api/resources";
import ResourceCardComponent from "../components/resources/ResourceCard";

export default function ResourcesPage() {
  const { t } = useI18n();
  const [resources, setResources] = useState<ResourceCard[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") ?? "";

  useEffect(() => {
    fetchResourceCategories()
      .then(setCategories)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const items = await fetchPublicResources({
          category: selectedCategory || undefined,
          limit: 24,
        });
        setResources(items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCategory]);

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

  return (
    <PageLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} mb={3}>
          {t("resources.listTitle")}
        </Typography>
        <TextField
          select
          label={t("resources.categoryFilter")}
          value={selectedCategory}
          onChange={(e) => {
            const value = e.target.value;
            const next = new URLSearchParams(searchParams);
            if (value) {
              next.set("category", value);
            } else {
              next.delete("category");
            }
            setSearchParams(next);
          }}
          sx={{ mb: 3, minWidth: 240 }}
        >
          <MenuItem value="">{t("resources.allCategories")}</MenuItem>
          {groupedCategories.map(([group, data]) => (
            <Fragment key={group}>
              <ListSubheader>{group}</ListSubheader>
              {data.items.map((cat) => (
                <MenuItem key={cat.code} value={cat.code}>
                  {cat.label}
                </MenuItem>
              ))}
            </Fragment>
          ))}
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
          </>
        )}
      </Box>
    </PageLayout>
  );
}
