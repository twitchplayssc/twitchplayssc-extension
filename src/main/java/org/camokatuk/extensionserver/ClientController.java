package org.camokatuk.extensionserver;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Date;

@RestController
@RequestMapping("/api")
public class ClientController
{
    private final StateManager stateManager;
    private final String extensionSecret;
    private final boolean devProfile;

    @Autowired
    public ClientController(StateManager stateManager, ConfigurableEnvironment env, @Value("${extension.secret}") String extensionSecret)
    {
        this.stateManager = stateManager;
        this.extensionSecret = extensionSecret;
        this.devProfile = Arrays.asList(env.getActiveProfiles()).contains("dev");
    }

    @CrossOrigin(origins = "*")
    //	@CrossOrigin(origins = "twitch.tv")
    @RequestMapping("/display")
    public
    @ResponseBody
    UserDisplayData index(@RequestHeader("Authorization") String authenticationHeader, @RequestParam(required = false) boolean fetchGlobalGameData)
    {
        String userId = "0";
        if (!devProfile)
        {
            authenticationHeader = authenticationHeader.substring("Bearer ".length());
            Jws<Claims> jws = Jwts.parser().setSigningKey(extensionSecret).parseClaimsJws(authenticationHeader);
            if (jws.getBody().getExpiration().before(new Date()))
            {
                return UserDisplayData.msg("You JWT has expired O_o");
            }
            userId = (String) jws.getBody().get("user_id");
        }

        return stateManager.getDisplayData(userId, fetchGlobalGameData);
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
