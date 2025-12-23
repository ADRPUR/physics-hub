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
  Link,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Logout, Person, Dashboard, Groups, MenuBook, Menu as MenuIcon } from "@mui/icons-material";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../api/http";
import LanguageSelector from "../components/LanguageSelector";
import { useI18n } from "../i18n";
import { fetchVisitCount } from "../api/public";

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
  const currentYear = new Date().getFullYear();
  const [visitCount, setVisitCount] = useState<number | null>(null);

  const menuItems = [
    ...(user?.role === "ADMIN"
      ? [{ key: "overview", label: t("layout.overview"), icon: <Dashboard />, to: "/overview" }]
      : []),
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

  useEffect(() => {
    fetchVisitCount()
      .then((data) => setVisitCount(data.total))
      .catch(() => undefined);
  }, []);

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
        <Box sx={{ flexGrow: 1, bgColor: "#F4F6F8", display: "flex", flexDirection: "column" }}>
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
          <Box sx={{ p: { xs: 1, sm: 3 }, flex: 1 }}>
            <Outlet />
          </Box>
          <Box
            component="footer"
            sx={{
              borderTop: "1px solid rgba(15,23,42,0.08)",
              py: 2.5,
              px: { xs: 2, sm: 3 },
              background:
                "linear-gradient(180deg, rgba(248,249,255,0.9) 0%, rgba(251,245,255,0.9) 100%)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                Physics Hub • {currentYear} • {t("footer.visitors")}{" "}
                {visitCount !== null ? visitCount.toLocaleString() : "—"}
              </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("footer.dedication")}{" "}
              <Link
                href="https://www.linkedin.com/in/adrian-purice-18047584"
                target="_blank"
                rel="noreferrer"
                underline="hover"
                >
                  Adrian Purice
                </Link>
                .
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
  );
}
