import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import { recordVisit } from "./api/public";
import { pingMe } from "./api/user";
import ToastProvider from "./components/ToastProvider";

export default function App() {
  const init = useAuthStore((state) => state.init);
  const token = useAuthStore((state) => state.token);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
    setReady(true);
  }, [init]);

  useEffect(() => {
    const key = "fizicamd_visit_tracked";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    recordVisit({ path: `${window.location.pathname}${window.location.search}`, referrer: document.referrer || undefined })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const sendPing = () => {
      if (!active) return;
      pingMe(token).catch(() => undefined);
    };
    sendPing();
    const interval = window.setInterval(sendPing, 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [token]);

  if (!ready) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <CssBaseline />
      <ToastProvider>
        <Router />
      </ToastProvider>
    </BrowserRouter>
  );
}
