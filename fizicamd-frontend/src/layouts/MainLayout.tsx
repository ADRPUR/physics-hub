import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../api/http";
import { useI18n } from "../i18n";
import LanguageSelector from "../components/LanguageSelector";
import { fetchVisitCount } from "../api/public";

const layoutBackground =
  "radial-gradient(circle at 10% 20%, rgba(91,92,255,0.15), transparent 55%),radial-gradient(circle at 90% 10%, rgba(255,126,92,0.15), transparent 55%),linear-gradient(180deg, #F8F9FF 0%, #FBF5FF 100%)";

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
        <Button variant="contained" onClick={() => navigate("/register")}>
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
          { label: t("layout.resources"), to: "/admin/resources" },
        ]
      : user.role === "TEACHER"
      ? [{ label: t("layout.resources"), to: "/admin/resources" }]
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
  const currentYear = new Date().getFullYear();
  const [visitCount, setVisitCount] = useState<number | null>(null);

  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const { user } = useAuthStore();

  const quickLinks = [
    { label: t("layout.home"), path: "/" },
    { label: t("resources.listTitle"), path: "/resources" },
    { label: t("home.searchAction"), path: "/search" },
    ...(user && (user.role === "TEACHER" || user.role === "ADMIN")
      ? [{ label: t("layout.studio"), path: "/teacher/studio" }]
      : []),
  ];

  useEffect(() => {
    fetchVisitCount()
      .then((data) => setVisitCount(data.total))
      .catch(() => undefined);
  }, []);

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" sx={{ background: layoutBackground }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          background: "transparent",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 2, justifyContent: "space-between" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                onClick={() => navigate("/")}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  component="img"
                  src="/physics_hub_atom.svg"
                  alt="Physics Hub"
                  sx={{ width: 42, height: 42, display: "block" }}
                />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Physics Hub
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("common.platformTitle")}
                  </Typography>
                </Box>
              </Box>
              {!isAuthPage && (
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ ml: { md: 4 } }}>
                  {quickLinks.map((link) => (
                    <Button
                      key={link.path}
                      variant="text"
                      color="inherit"
                      onClick={() => navigate(link.path)}
                      sx={{ color: "text.secondary" }}
                    >
                      {link.label}
                    </Button>
                  ))}
                </Stack>
              )}
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <LanguageSelector />
              <AvatarMenu />
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" flex={1} py={isAuthPage ? 4 : 6}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          borderTop: "1px solid rgba(15,23,42,0.08)",
          py: 3,
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="lg">
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
              Dedicat tuturor pasionatilor de fizica, creat cu suflet de{" "}
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
        </Container>
      </Box>
    </Box>
  );
}
