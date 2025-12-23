import { Stack, Typography } from "@mui/material";
import { useI18n } from "../i18n";
import PageLayout from "../components/PageLayout";
import NavigationSidebar from "../components/NavigationSidebar";

export default function TeacherStudioPage() {
  const { t } = useI18n();

  return (
    <PageLayout>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={700}>
          {t("layout.studio")}
        </Typography>
        <NavigationSidebar editable />
      </Stack>
    </PageLayout>
  );
}
