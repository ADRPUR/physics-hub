import { Box } from "@mui/material";
import type { ReactNode } from "react";

export default function PageLayout({ children, sidebarEditable = false }: { children: ReactNode; sidebarEditable?: boolean }) {
  void sidebarEditable;
  return (
    <Box>
      {children}
    </Box>
  );
}
