import { Card, CardContent, Typography, List, ListItemButton, ListItemText, Stack } from "@mui/material";
import { useNavigationTree } from "../contexts/navigationContext";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";

export default function NavigationSidebar() {
  const { tree } = useNavigationTree();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Card elevation={0} variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {t("home.sidebarTitle")}
        </Typography>
        <Stack spacing={2}>
          {tree.map((node) => (
            <div key={node.id}>
              <Typography variant="body1" fontWeight={600}>
                {node.title}
              </Typography>
              <List dense sx={{ mt: 1 }}>
                {node.children.map((child) => (
                  <ListItemButton
                    key={child.id}
                    sx={{ borderRadius: 1 }}
                    onClick={() => navigate(`/resources/${child.slug}`)}
                  >
                    <ListItemText primary={child.title} secondary={child.href ? child.href.replace(/^https?:\/\//, "") : undefined} />
                  </ListItemButton>
                ))}
              </List>
            </div>
          ))}
          {tree.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t("home.noNavigation")}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
