import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../api/http";
import { useI18n } from "../i18n";
import LanguageSelector from "../components/LanguageSelector";
import { NavigationProvider } from "../contexts/navigationContext";

const gradientBg =
  "linear-gradient(120deg, rgba(31,41,55,1) 0%, rgba(79,70,229,1) 50%, rgba(147,51,234,1) 100%)";

function AvatarMenu() {
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) {
    return (
      <Stack direction="row" spacing={1}>
        <Button color="inherit" onClick={() => navigate("/login")}>
          {t("login.title")}
        </Button>
        <Button variant="contained" color="secondary" onClick={() => navigate("/register")}>
          {t("register.title")}
        </Button>
      </Stack>
    );
  }

  const initials = `${user.profile?.firstName?.[0] ?? ""}${user.profile?.lastName?.[0] ?? ""}` || user.email[0];

  const menuItems = [
    { label: t("layout.home"), to: "/" },
    { label: t("layout.overview"), to: "/overview" },
    { label: t("layout.profile"), to: "/profile" },
    ...(user.role === "TEACHER" || user.role === "ADMIN"
      ? [{ label: t("layout.studio"), to: "/teacher/studio" }]
      : []),
    ...(user.role === "ADMIN"
      ? [
          { label: t("layout.users"), to: "/admin/users" },
          { label: t("layout.sidebar"), to: "/admin/navigation" },
        ]
      : []),
  ];

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Avatar
          src={user.profile?.avatarUrl ? `${API_URL}${user.profile.avatarUrl}?t=${Date.now()}` : undefined}
          sx={{ bgcolor: "secondary.main", width: 36, height: 36 }}
        >
          {initials}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.to}
            onClick={() => {
              navigate(item.to);
              setAnchorEl(null);
            }}
          >
            {item.label}
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => {
            logout();
            setAnchorEl(null);
            navigate("/");
          }}
        >
          {t("layout.profileMenu.logout")}
        </MenuItem>
      </Menu>
    </>
  );
}

export default function MainLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  const onSearch = () => {
    const query = search.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <NavigationProvider>
      <Box minHeight="100vh" display="flex" flexDirection="column">
        <AppBar position="static" sx={{ background: gradientBg }}>
          <Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h5" fontWeight={700} color="inherit" sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
                Physics Hub
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                {t("common.platformTitle")}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <LanguageSelector />
              <AvatarMenu />
            </Stack>
          </Toolbar>
          {!isAuthPage && (
            <Container sx={{ py: 3 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label={t("home.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearch();
                  }}
                  fullWidth
                  InputProps={{ sx: { backgroundColor: "rgba(255,255,255,0.1)", color: "white" } }}
                  InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                />
                <Button variant="contained" color="secondary" onClick={onSearch}>
                  {t("home.searchAction")}
                </Button>
              </Stack>
            </Container>
          )}
        </AppBar>
        <Box component="main" flex={1} py={isAuthPage ? 4 : 6} bgcolor="#f5f6fb">
          <Container maxWidth="lg">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </NavigationProvider>
  );
}
