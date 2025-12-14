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

  public String store(UUID assetId, MultipartFile file) throws IOException {
    var target = baseDir.resolve(assetId.toString());
    try (var input = file.getInputStream()) {
      Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
    }
    return target.toString();
  }

  public Resource load(UUID assetId) throws IOException {
    var path = baseDir.resolve(assetId.toString());
    if (!Files.exists(path)) {
      return null;
    }
    return new UrlResource(path.toUri());
  }

  public void delete(UUID assetId) {
    var path = baseDir.resolve(assetId.toString());
    try {
      Files.deleteIfExists(path);
    } catch (IOException ignored) {
      // best-effort cleanup; log later if needed
    }
  }
}
