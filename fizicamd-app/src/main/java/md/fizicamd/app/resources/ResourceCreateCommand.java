package md.fizicamd.app.resources;

import java.util.List;
import java.util.UUID;

public record ResourceCreateCommand(
  String categoryCode,
  String title,
  String summary,
  UUID avatarAssetId,
  List<String> tags,
  List<ResourceContentBlock> blocks,
  ResourceStatus status
) {}
