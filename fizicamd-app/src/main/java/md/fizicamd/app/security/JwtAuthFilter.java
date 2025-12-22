package md.fizicamd.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {

    var auth = request.getHeader("Authorization");
    if (auth != null && auth.startsWith("Bearer ")) {
      var token = auth.substring(7);
      try {
        var claims = jwtService.parse(token);
        var userId = claims.getSubject();
        @SuppressWarnings("unchecked")
        var roles = (List<String>) claims.get("roles", List.class);

        var authorities = roles == null ? List.<SimpleGrantedAuthority>of() :
          roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).collect(Collectors.toList());

        var principal = claims.get("email", String.class);
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
        authentication.setDetails(userId);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        log.debug("Authenticated {} {} as {} (roles={})", request.getMethod(), request.getRequestURI(), userId, roles);
      } catch (Exception ex) {
        log.debug("JWT parsing failed for {} {}", request.getMethod(), request.getRequestURI(), ex);
        // invalid token -> let request continue as unauthenticated
      }
    }

    filterChain.doFilter(request, response);
  }
}
