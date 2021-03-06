package org.camokatuk.extensionserver;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
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
	private String extensionSecret;

	@Autowired
	public ClientController(StateManager stateManager, @Value("${extension.secret}") String extensionSecret)
	{
		this.stateManager = stateManager;
		this.extensionSecret = extensionSecret;
	}

	@CrossOrigin(origins = "*")
	//	@CrossOrigin(origins = "twitch.tv")
	@RequestMapping("/display")
	public
	@ResponseBody
	UserDisplayData index(@RequestHeader("Authorization") String authenticationHeader)
	{
		authenticationHeader = authenticationHeader.substring("Bearer ".length());
		Jws<Claims> jws = Jwts.parser().setSigningKey(extensionSecret).parseClaimsJws(authenticationHeader);
		if (jws.getBody().getExpiration().before(new Date()))
		{
			return UserDisplayData.msg("You JWT has expired O_o");
		}

		String userId = (String) jws.getBody().get("user_id");
		return stateManager.getDisplayData(userId);
	}

	@CrossOrigin(origins = "*")
	//	@CrossOrigin(origins = "twitch.tv")
	@RequestMapping("/state")
	public
	@ResponseBody
	GameStateContainer index()
	{
		return stateManager.getCurrentState();
	}
}
