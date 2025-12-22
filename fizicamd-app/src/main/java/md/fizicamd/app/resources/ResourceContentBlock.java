package md.fizicamd.app.resources;

import java.util.UUID;

public record ResourceContentBlock(
  ResourceBlockType type,
  String text,
  String url,
  UUID assetId,
  String caption,
  String title
) {}
