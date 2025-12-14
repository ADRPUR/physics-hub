package md.fizicamd.media.application;

import java.time.Duration;
import java.util.Map;

public interface ObjectStoragePort {
  PresignedUpload presignUpload(String storageKey, String contentType, Duration ttl);

  record PresignedUpload(String url, Map<String, String> headers) {}
}
