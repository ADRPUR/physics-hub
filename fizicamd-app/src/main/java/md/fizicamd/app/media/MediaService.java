package md.fizicamd.app.media;

import md.fizicamd.identity.application.UserProfileRepository;
import md.fizicamd.identity.domain.Profile.UserProfile;
import md.fizicamd.media.domain.MediaAsset;
import md.fizicamd.media.domain.MediaType;
import md.fizicamd.shared.NotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Service
public class MediaService {
  private final MediaAssetRepository assets;
  private final UserProfileRepository profiles;
  private final MediaStorageService storage;

  public MediaService(MediaAssetRepository assets, UserProfileRepository profiles, MediaStorageService storage) {
    this.assets = assets;
    this.profiles = profiles;
    this.storage = storage;
  }

  @Transactional
  public UploadResponse uploadAvatar(UUID userId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Fișierul este gol.");
    }
    var contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
    var assetId = UUID.randomUUID();
    var asset = new MediaAsset(
            assetId,
            userId,
            MediaType.AVATAR,
            contentType,
            file.getSize(),
            "local",
            assetId.toString(),
            Instant.now()
    );
    asset.setFilename(file.getOriginalFilename());
    assets.save(asset);

    try {
      storage.store(assetId, file);
    } catch (IOException e) {
      throw new RuntimeException("Nu am putut salva fișierul.", e);
    }

    var profile = profiles.findById(userId).orElseGet(() -> new UserProfile(userId));
    var previousAvatar = profile.getAvatarMediaId();
    profile.setAvatarMediaId(assetId);
    profiles.save(profile);

    removeAsset(previousAvatar);

    return new UploadResponse(assetId, buildAssetUrl(assetId));
  }

  @Transactional(readOnly = true)
  public MediaContent loadContent(UUID assetId) {
    var asset = assets.findById(assetId).orElseThrow(() -> new NotFoundException("Media negăsită"));
    try {
      Resource resource = storage.load(assetId);
      if (resource == null || !resource.exists()) {
        throw new NotFoundException("Fișierul nu mai există");
      }
      return new MediaContent(asset, resource);
    } catch (IOException e) {
      throw new RuntimeException("Nu am putut încărca fișierul media", e);
    }
  }

  public record UploadResponse(UUID assetId, String url) {}

  public record MediaContent(MediaAsset asset, Resource resource) {}

  public static String buildAssetUrl(UUID assetId) {
    return "/media/assets/" + assetId + "/content";
  }

  public void deleteAsset(UUID assetId) {
    if (assetId == null) {
      return;
    }
    assets.findById(assetId).ifPresent(asset -> {
      assets.delete(asset);
      storage.delete(assetId);
    });
  }

  private void removeAsset(UUID assetId) {
    deleteAsset(assetId);
  }
}
