import { Box, Button, Card, CardContent, CardMedia, Link, Stack, Typography } from "@mui/material";
import type { ResourceBlock } from "../../types/resources";
import { useI18n } from "../../i18n";
import { absoluteMediaUrl } from "../../utils/media";
import TeX from "@matejmazur/react-katex";

interface Props {
  blocks: ResourceBlock[];
}

export default function ResourceContent({ blocks }: Props) {
  const { t } = useI18n();

  if (!blocks?.length) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "TEXT":
            return (
              <Typography key={idx} variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {block.text}
              </Typography>
            );
          case "LINK":
            return (
              <Typography key={idx} variant="body1">
                <Link href={block.url ?? "#"} target="_blank" rel="noreferrer" underline="always">
                  {block.title ?? block.url}
                </Link>
              </Typography>
            );
          case "IMAGE": {
            const media = absoluteMediaUrl(block.mediaUrl);
            return (
              <Card key={idx} variant="outlined">
                {media && (
                  <CardMedia component="img" image={media} alt={block.caption ?? block.title ?? "image"} />
                )}
                {(block.caption || block.title) && (
                  <CardContent>
                    <Typography variant="caption">{block.caption ?? block.title}</Typography>
                  </CardContent>
                )}
              </Card>
            );
          }
        case "PDF": {
          const media = absoluteMediaUrl(block.mediaUrl);
          return (
            <Box key={idx}>
              <Typography variant="subtitle2" gutterBottom>
                {block.title ?? "PDF"}
              </Typography>
              <Button
                variant="outlined"
                href={media ?? "#"}
                target="_blank"
                rel="noreferrer"
              >
                {t("resources.downloadPdf")}
              </Button>
            </Box>
          );
        }
        case "FORMULA":
          return (
            <Typography key={idx} variant="body1" sx={{ textAlign: "center" }}>
              <TeX block math={block.text ?? ""} />
            </Typography>
          );
        default:
          return null;
      }
    })}
    </Stack>
  );
}
