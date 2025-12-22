import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import App from "./App";
import { I18nProvider } from "./i18n";
import "katex/dist/katex.min.css";

if (typeof window !== "undefined" && !(window as typeof globalThis & { global?: typeof globalThis }).global) {
  (window as typeof globalThis & { global?: typeof globalThis }).global = window;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </I18nProvider>
);
