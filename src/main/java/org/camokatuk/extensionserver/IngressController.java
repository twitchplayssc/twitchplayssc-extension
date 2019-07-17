package org.camokatuk.extensionserver;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class IngressController
{
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
	String pushStats(@RequestBody Map<String, PlayerStats> state, @RequestHeader(value = "Authentication") String ohWowSecurity)
	{
		if (isNotAuthorizedRequest(ohWowSecurity))
		{
			return "Nope";
		}

		stateManager.pushPlayerStats(state);
		return "OK";
	}

	@CrossOrigin(origins = "*")
	@PostMapping("/playerstats/reset")
	public
	@ResponseBody
	String resetStats(@RequestHeader(value = "Authentication") String ohWowSecurity)
	{
		if (isNotAuthorizedRequest(ohWowSecurity))
		{
			return "Nope";
		}

		stateManager.resetPlayerStats();
		return "OK";
	}

	private boolean isNotAuthorizedRequest(String authHeader)
	{
		return superSecretKey.equals(authHeader);
	}
}