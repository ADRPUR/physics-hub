package md.fizicamd.app.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class MediaStorageService {
  private final Path baseDir;

  public MediaStorageService(@Value("${media.storage.local-path:storage/media}") String baseDir) throws IOException {
    this.baseDir = Path.of(baseDir).toAbsolutePath().normalize();
    Files.createDirectories(this.baseDir);
  }

  public String store(MediaAssetDescriptor asset, MultipartFile file) throws IOException {
    var target = resolveTarget(asset);
    Files.createDirectories(target.getParent());
    try (var input = file.getInputStream()) {
      Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
    }
    return target.toString();
  }

  public Resource load(MediaAssetDescriptor asset) throws IOException {
    var path = resolveTarget(asset);
    if (!Files.exists(path)) {
      var legacy = legacyPath(asset.assetId());
      if (!Files.exists(legacy)) {
        return null;
      }
      return new UrlResource(legacy.toUri());
    }
    return new UrlResource(path.toUri());
  }

  public void delete(MediaAssetDescriptor asset) {
    var path = resolveTarget(asset);
    try {
      Files.deleteIfExists(path);
      Files.deleteIfExists(legacyPath(asset.assetId()));
    } catch (IOException ignored) {
      // best-effort cleanup; log later if needed
    }
  }

  private Path resolveTarget(MediaAssetDescriptor asset) {
    var bucket = (asset.bucket() == null || asset.bucket().isBlank()) ? "default" : asset.bucket();
    var storageKey = asset.storageKey() != null ? asset.storageKey() : asset.assetId().toString();
    return baseDir.resolve(bucket).resolve(storageKey);
  }

  private Path legacyPath(UUID assetId) {
    return baseDir.resolve(assetId.toString());
  }

  public record MediaAssetDescriptor(UUID assetId, String bucket, String storageKey) {}
}
