package md.fizicamd.app.api.publicsite;

import jakarta.servlet.http.HttpServletRequest;
import md.fizicamd.app.analytics.SiteVisit;
import md.fizicamd.app.analytics.SiteVisitRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/visits")
public class PublicVisitsController {
  private static final int MAX_VALUE_LENGTH = 512;
  private static final int MAX_PATH_LENGTH = 255;

  private final SiteVisitRepository visitRepository;

  public PublicVisitsController(SiteVisitRepository visitRepository) {
    this.visitRepository = visitRepository;
  }

  @PostMapping
  public void trackVisit(@RequestBody(required = false) VisitRequest request, HttpServletRequest http) {
    String ip = resolveClientIp(http);
    String userAgent = trim(http.getHeader("User-Agent"), MAX_VALUE_LENGTH);
    String path = trim(request != null ? request.path() : null, MAX_PATH_LENGTH);
    String referrer = trim(request != null ? request.referrer() : null, MAX_VALUE_LENGTH);
    visitRepository.save(new SiteVisit(ip, userAgent, path, referrer));
  }

  @GetMapping("/count")
  public VisitCountResponse count() {
    return new VisitCountResponse(visitRepository.count());
  }

  private static String resolveClientIp(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      int comma = forwarded.indexOf(',');
      return trim(comma >= 0 ? forwarded.substring(0, comma) : forwarded, MAX_VALUE_LENGTH);
    }
    return trim(request.getRemoteAddr(), MAX_VALUE_LENGTH);
  }

  private static String trim(String value, int maxLen) {
    if (value == null) {
      return null;
    }
    String cleaned = value.trim();
    if (cleaned.isEmpty()) {
      return null;
    }
    return cleaned.length() > maxLen ? cleaned.substring(0, maxLen) : cleaned;
  }

  public record VisitRequest(String path, String referrer) {}
  public record VisitCountResponse(long total) {}
}
