package org.camokatuk.extensionserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;

@RestController
@RequestMapping("/api")
public class ClientController
{
	private final StateManager stateManager;
	private final SecretService secretService;

	@Autowired
	public ClientController(StateManager stateManager, SecretService secretService)
	{
		this.stateManager = stateManager;
		this.secretService = secretService;
	}

	@CrossOrigin(origins = "*")
	//	@CrossOrigin(origins = "twitch.tv")
	@RequestMapping("/resources")
	public
	@ResponseBody
	PlayerStats index(@RequestParam("uid") int userId, @RequestHeader("Authorization") String authenticationHeader)
	{
		authenticationHeader = authenticationHeader.substring("Bearer ".length());
		Jws<Claims> jws = Jwts.parser().setSigningKey("vVxlKypSyNa6bBtUTzhYGf93IJX9Vzu0FvUTdk4b0o0=").parseClaimsJws(authenticationHeader);
		return stateManager.getPlayerStats(userId);
	}
}
