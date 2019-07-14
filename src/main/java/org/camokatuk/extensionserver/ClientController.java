package org.camokatuk.extensionserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ClientController
{
	private final StateManager stateManager;

	@Autowired
	public ClientController(StateManager stateManager)
	{
		this.stateManager = stateManager;
	}

	@CrossOrigin(origins = "*")
	//	@CrossOrigin(origins = "twitch.tv")
	@RequestMapping("/resources")
	public
	@ResponseBody
	PlayerStats index(@RequestParam("uid") String userId)
	{
		return stateManager.getPlayerStats(userId);
	}
}
