package com.plaid.quickstart.resources;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/link_exit_error")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class LinkExitErrorResource {
  private static final ObjectMapper objectMapper = new ObjectMapper();

  @POST
  public Map<String, String> logLinkExitError(Map<String, Object> body) {
    System.out.println("[Link Exit Error (frontend)]");
    try {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(body));
    } catch (Exception e) {
      System.out.println(body);
    }
    return Map.of("status", "logged");
  }
}
