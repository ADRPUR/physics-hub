import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#5B5CFF", contrastText: "#fff" },
    secondary: { main: "#FF7F5C" },
    background: {
      default: "#F5F6FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#5B6476",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Onest', 'Inter', sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.03em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 600, letterSpacing: "-0.02em" },
    h4: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F5F6FB",
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(91,92,255,0.12), transparent 45%),
            radial-gradient(circle at 80% 0%, rgba(255,126,92,0.12), transparent 55%)
          `,
          minHeight: "100vh",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 20,
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(91,92,255,0.08)",
          boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
          background: "linear-gradient(135deg, rgba(91,92,255,0.08), rgba(255,126,92,0.08))",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(91,92,255,0.08)",
          boxShadow: "0 15px 35px rgba(15,23,42,0.05)",
          background: "linear-gradient(140deg, rgba(245,246,251,0.96), rgba(255,236,244,0.92))",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: "linear-gradient(140deg, rgba(248,249,255,0.95), rgba(255,236,244,0.9))",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(91,92,255,0.35)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(91,92,255,0.7)",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          background: "transparent",
        },
        icon: {
          color: "rgba(15,23,42,0.6)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
