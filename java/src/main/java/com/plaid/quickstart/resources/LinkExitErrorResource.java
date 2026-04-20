package com.plaid.quickstart.resources;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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
