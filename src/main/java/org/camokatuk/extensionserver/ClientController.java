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
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ClientController
{
    private final StateManager stateManager;
    private final PlayerEventManager playerEventManager;
    private final String extensionSecret;
    private final boolean devProfile;

    @Autowired
    public ClientController(StateManager stateManager, PlayerEventManager playerEventManager,
                            ConfigurableEnvironment env, @Value("${extension.secret}") String extensionSecret)
    {
        this.stateManager = stateManager;
        this.extensionSecret = extensionSecret;
        this.playerEventManager = playerEventManager;
        this.devProfile = Arrays.asList(env.getActiveProfiles()).contains("dev");
    }

    @CrossOrigin(origins = "*")
    //	@CrossOrigin(origins = "twitch.tv")
    @RequestMapping("/display")
    public
    @ResponseBody
    UserDisplayData index(@RequestHeader("Authorization") String authenticationHeader, @RequestParam(required = false) boolean fetchGlobalGameData)
    {
        Optional<String> userIdOptional = getUserIdFromAuth(authenticationHeader);
        if (userIdOptional.isEmpty())
        {
            return UserDisplayData.msg("You JWT has expired O_o");
        }

        String userId = userIdOptional.get();
        playerEventManager.userOnline(userId);
        return stateManager.getDisplayData(userId, fetchGlobalGameData);
    }

    @CrossOrigin(origins = "*")
    //	@CrossOrigin(origins = "twitch.tv")
    @PostMapping("/skill/levelup")
    public
    @ResponseBody
    String levelUpSkill(@RequestHeader("Authorization") String authenticationHeader, @RequestParam int skillId)
    {
        Optional<String> userIdOptional = getUserIdFromAuth(authenticationHeader);
        if (userIdOptional.isEmpty())
        {
            return "You JWT has expired O_o";
        }

        playerEventManager.levelUpSkill(userIdOptional.get(), skillId);
        return "OK";
    }

    private Optional<String> getUserIdFromAuth(String authenticationHeader)
    {
        String userId = "77080650";
        if (!devProfile)
        {
            authenticationHeader = authenticationHeader.substring("Bearer ".length());
            Jws<Claims> jws = Jwts.parser().setSigningKey(extensionSecret).parseClaimsJws(authenticationHeader);
            if (jws.getBody().getExpiration().before(new Date()))
            {
                return Optional.empty();
            }
            userId = (String) jws.getBody().get("user_id");
        }
        return Optional.of(userId);
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
