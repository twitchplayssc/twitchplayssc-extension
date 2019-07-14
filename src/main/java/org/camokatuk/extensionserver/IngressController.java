package org.camokatuk.extensionserver;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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
	private static String EXTREMELY_SECURE_VALIDATION_TOKEN = "H2Mk7jCJzpCTusP6maXWmWDW6fqV";

	private final StateManager stateManager;

	@Autowired
	public IngressController(StateManager stateManager)
	{
		this.stateManager = stateManager;
	}

	@CrossOrigin(origins = "*")
	@PostMapping("/playerstats")
	public
	@ResponseBody
	String index(@RequestBody Map<String, PlayerStats> state, @RequestHeader(value = "Authentication") String ohWowSecurity)
	{
		if (!EXTREMELY_SECURE_VALIDATION_TOKEN.equals(ohWowSecurity))
		{
			return "Nope";
		}

		stateManager.renewState(state);
		return "OK";
	}
}