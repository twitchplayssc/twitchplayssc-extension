package org.camokatuk.extensionserver;

import java.io.IOException;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api")
public class IngressController
{
	private static final Log LOG = LogFactory.getLog(IngressController.class);

	private final StateManager stateManager;
	private final String superSecretKey;

	@Autowired
	public IngressController(StateManager stateManager, @Value("${extension.ingress.password}") String superSecretKey)
	{
		this.stateManager = stateManager;
		this.superSecretKey = superSecretKey;
	}

	@CrossOrigin(origins = "*")
	@PostMapping("/playerstats")
	public
	@ResponseBody
	String pushStats(@RequestBody String request, @RequestHeader(value = "Authentication") String ohWowSecurity) throws IOException
	{
		if (isNotAuthorizedRequest(ohWowSecurity))
		{
			return "Nope";
		}

		LOG.info("Raw request " + request);

		ObjectMapper mapper = new ObjectMapper();
		Map<String, UserDisplayData> state = mapper.readValue(request, Map.class);
		stateManager.pushPlayerStats(state);
		return "OK";
	}

	@CrossOrigin(origins = "*")
	@PostMapping("/state")
	public
	@ResponseBody
	String resetStats(@RequestBody GameStateContainer gameStateContainer, @RequestHeader(value = "Authentication") String ohWowSecurity)
	{
		if (isNotAuthorizedRequest(ohWowSecurity))
		{
			return "Nope";
		}

		stateManager.pushGameState(gameStateContainer);
		return "OK";
	}

	private boolean isNotAuthorizedRequest(String authHeader)
	{
		return !superSecretKey.equals(authHeader);
	}
}