import { Box } from "@mui/material";
import type { ReactNode } from "react";
import NavigationSidebar from "./NavigationSidebar";

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      display="grid"
      gap={3}
      gridTemplateColumns={{ xs: "1fr", lg: "minmax(0, 280px) minmax(0, 1fr)" }}
      alignItems="flex-start"
    >
      <Box>
        <NavigationSidebar />
      </Box>
      <Box>
        {children}
      </Box>
    </Box>
  );
}
