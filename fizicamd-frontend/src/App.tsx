import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import { recordVisit } from "./api/public";

export default function App() {
  const init = useAuthStore((state) => state.init);
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
      <Router />
    </BrowserRouter>
  );
}
