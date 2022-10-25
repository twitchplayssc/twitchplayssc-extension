package org.camokatuk.extensionserver;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api")
public class ClientController
{
    private final Log logger = LogFactory.getLog(getClass());
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
    UserDisplayData index(@RequestHeader("Authorization") String authenticationHeader, @RequestParam(required = false) boolean fetchGlobalGameData)
    {
        authenticationHeader = authenticationHeader.substring("Bearer ".length());
        Jws<Claims> jws = Jwts.parser().setSigningKey(extensionSecret).parseClaimsJws(authenticationHeader);
        if (jws.getBody().getExpiration().before(new Date()))
        {
            return UserDisplayData.msg("You JWT has expired O_o");
        }

        String userId = (String) jws.getBody().get("user_id");
        UserDisplayData userData = stateManager.getDisplayData(userId, fetchGlobalGameData);
        logger.debug("Got display request for user_id = " + userId + "\n. Response:\n" + userData.getState());
        return userData;
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
