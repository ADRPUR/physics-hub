package md.fizicamd.app.api.media;

import md.fizicamd.app.media.MediaService;
import md.fizicamd.shared.NotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {
  private final MediaService mediaService;

  public MediaController(MediaService mediaService) {
    this.mediaService = mediaService;
  }

  @PostMapping("/uploads/avatar")
  public MediaService.UploadResponse uploadAvatar(@RequestParam("file") MultipartFile file, Authentication auth) {
    return mediaService.uploadAvatar(currentUserId(auth), file);
  }

  @GetMapping("/assets/{assetId}/content")
  public ResponseEntity<Resource> download(@PathVariable UUID assetId) {
    var content = mediaService.loadContent(assetId);
    var headers = new HttpHeaders();
    if (content.asset().getFilename() != null) {
      headers.setContentDispositionFormData("inline", content.asset().getFilename());
    }
    return ResponseEntity.ok()
            .headers(headers)
            .contentType(MediaType.parseMediaType(content.asset().getContentType()))
            .body(content.resource());
  }

  private static UUID currentUserId(Authentication auth) {
    var id = auth != null ? auth.getDetails() : null;
    if (id instanceof UUID uuid) {
      return uuid;
    }
    if (id instanceof String str) {
      return UUID.fromString(str);
    }
    throw new NotFoundException("User context missing");
  }
}
