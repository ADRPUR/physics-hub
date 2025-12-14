import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Logout, Person, Dashboard, Groups, MenuBook, Menu as MenuIcon } from "@mui/icons-material";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../api/http";
import LanguageSelector from "../components/LanguageSelector";
import { useI18n } from "../i18n";

// Helper for user initials
function getInitials(name?: string, fallback = "?") {
  if (!name) return fallback;
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    { key: "overview", label: t("layout.overview"), icon: <Dashboard />, to: "/overview" },
    { key: "profile", label: t("layout.profile"), icon: <Person />, to: "/profile" },
    ...(user && (user.role === "TEACHER" || user.role === "ADMIN")
      ? [{ key: "studio", label: t("layout.studio"), icon: <MenuBook />, to: "/teacher/studio" }]
      : []),
    ...(user?.role === "ADMIN"
      ? [
          { key: "users", label: t("layout.users"), icon: <Groups />, to: "/admin/users" },
          { key: "navigation", label: t("layout.sidebar"), icon: <MenuIcon />, to: "/admin/navigation" },
        ]
      : []),
  ];

  return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <Drawer
            variant="permanent"
            sx={{
              width: 220,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: 220,
                boxSizing: "border-box",
                bgColor: "#F4F6F8",
                borderRight: `1px solid ${theme.palette.divider}`,
              },
            }}
        >
          <Toolbar>
            <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
              {/* Small logo or title */}
              FizicaMD
            </Typography>
          </Toolbar>
          <List>
            {menuItems.map(item => (
                <ListItem
                    key={item.key}
                    disablePadding
                    sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemButton
                      component={Link}
                      to={item.to}
                      selected={location.pathname.startsWith(item.to)}
                      sx={{
                        borderRadius: 2,
                        ...(location.pathname.startsWith(item.to)
                            ? {
                              bgColor: "#e0e7ff",
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                            }
                            : {}),
                      }}
                  >
                    <ListItemIcon
                        sx={{
                          color: location.pathname.startsWith(item.to)
                              ? theme.palette.primary.main
                              : "inherit",
                        }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, bgColor: "#F4F6F8" }}>
          {/* Topbar */}
          <AppBar position="static" color="inherit" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
              {t("common.platformTitle")}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <LanguageSelector />
              <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ ml: 2 }}>
                <Avatar
                    src={
                      user?.profile?.avatarUrl
                          ? `${API_URL}${user.profile.avatarUrl}?t=${Date.now()}`
                          : undefined
                    }
                    sx={{ bgColor: "#6366f1" }}
                >
                  {getInitials(`${user?.profile?.firstName ?? ""} ${user?.profile?.lastName ?? ""}`)}
                </Avatar>
              </IconButton>
              <Menu
                  open={!!anchorEl}
                  anchorEl={anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      setAnchorEl(null);
                    }}
                >
                  {t("layout.profileMenu.profile")}
                </MenuItem>
                <MenuItem
                    onClick={() => {
                      logout();
                      navigate("/login");
                      setAnchorEl(null);
                    }}
                >
                  {t("layout.profileMenu.logout")} <Logout fontSize="small" style={{ marginLeft: 8 }} />
                </MenuItem>
              </Menu>
            </Stack>
            </Toolbar>
          </AppBar>
          {/* Page content */}
          <Box sx={{ p: { xs: 1, sm: 3 } }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
  );
}
