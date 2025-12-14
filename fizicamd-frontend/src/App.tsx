import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const init = useAuthStore((state) => state.init);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
    setReady(true);
  }, [init]);

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
