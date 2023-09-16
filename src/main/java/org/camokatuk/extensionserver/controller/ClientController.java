package org.camokatuk.extensionserver.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.camokatuk.extensionserver.*;
import org.camokatuk.extensionserver.twitchapi.TwitchApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/client")
public class ClientController {
    private final Log logger = LogFactory.getLog(getClass());

    private final StateManager stateManager;
    private final PlayerEventManager playerEventManager;
    private final GlobalInfoManager globalInfoManager;
    private final TwitchApi twitchApi;
    private final String extensionSecret;
    private final boolean devProfile;

    @Autowired
    public ClientController(StateManager stateManager, PlayerEventManager playerEventManager,
                            GlobalInfoManager globalInfoManager, TwitchApi twitchApi,
                            ConfigurableEnvironment env, @Value("${extension.secret}") String extensionSecret) {
        this.stateManager = stateManager;
        this.twitchApi = twitchApi;
        this.extensionSecret = extensionSecret;
        this.playerEventManager = playerEventManager;
        this.globalInfoManager = globalInfoManager;
        this.devProfile = Arrays.asList(env.getActiveProfiles()).contains("dev");
    }

    @CrossOrigin(origins = "*")
    //	@CrossOrigin(origins = "twitch.tv")
    @RequestMapping("/state")
    public
    @ResponseBody
    GameStateContainer index() {
        return stateManager.getCurrentState();
    }

    @CrossOrigin(origins = "*")
    //	@CrossOrigin(origins = "twitch.tv")
    @RequestMapping("/display")
    public
    @ResponseBody
    UserDisplayData index(@RequestHeader("Authorization") String authenticationHeader,
                          @RequestParam(required = false) boolean fetchGlobalGameData,
                          @RequestParam(required = false) boolean firstRequest) {
        Optional<String> username = getUserNameFromAuth(authenticationHeader);
        if (username.isEmpty()) {
            return UserDisplayData.msg("Extension requires permissions");
        }

        playerEventManager.userOnline(username.get());
        UserDisplayData userDisplayData = stateManager.getDisplayData(username.get(), fetchGlobalGameData);
        if (firstRequest) {
            globalInfoManager.addGlobalData(userDisplayData);
        }
        globalInfoManager.addXpData(username.get(), userDisplayData);
        return userDisplayData;
    }

    @CrossOrigin(origins = "*")
    //	@CrossOrigin(origins = "twitch.tv")
    @GetMapping("/playerstatsglobal")
    public
    @ResponseBody
    ResponseEntity<PlayerGlobalStats> getPlayerData(@RequestHeader("Authorization") String authenticationHeader) {
        Optional<String> username = getUserNameFromAuth(authenticationHeader);
        if (username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        PlayerGlobalStats playerGlobalStats = globalInfoManager.get(username.get()).orElse(null);
        return ResponseEntity.ok(playerGlobalStats);
    }

    @CrossOrigin(origins = "*")
    //	@CrossOrigin(origins = "twitch.tv")
    @PostMapping("/skills/levelup")
    public
    @ResponseBody
    ResponseEntity<String> levelUpSkill(@RequestHeader("Authorization") String authenticationHeader, @RequestParam int skillId) {
        Optional<String> username = getUserNameFromAuth(authenticationHeader);
        if (username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Can't get your Twitch username. Either expired JWT or some other authentication nonsense");
        }
        playerEventManager.levelUpSkill(username.get(), skillId);
        return ResponseEntity.ok().body("OK");
    }


    @CrossOrigin(origins = "*")
    //	@CrossOrigin(origins = "twitch.tv")
    @GetMapping("/polls")
    public
    @ResponseBody
    ResponseEntity<String> getPolls(@RequestHeader("Authorization") String authenticationHeader) {
        Optional<String> username = getUserNameFromAuth(authenticationHeader);
        if (username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Can't get your Twitch username. Either expired JWT or some other authentication nonsense");
        }
        return ResponseEntity.ok().body("OK");
    }

    private Optional<String> getUserNameFromAuth(String authenticationHeader) {
        Optional<String> userIdOptional = getUserIdFromAuth(authenticationHeader);
        if (userIdOptional.isEmpty()) {
            return Optional.empty();
        }
        Integer userId = Utils.parseNumericUserId(userIdOptional.get());
        if (userId == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(twitchApi.getUserDisplayName(userId));
    }

    private Optional<String> getUserIdFromAuth(String authenticationHeader) {
        if (devProfile) {
            return Optional.of("77080650");
        }

        authenticationHeader = authenticationHeader.substring("Bearer ".length());
        try {
            Jws<Claims> jws = Jwts.parser().setSigningKey(extensionSecret).parseClaimsJws(authenticationHeader);
            if (jws.getBody().getExpiration().before(new Date())) {
                return Optional.empty();
            }
            String userId = (String) jws.getBody().get("user_id");
            return Optional.of(userId);
        } catch (Exception e) {
            logger.error("Can't parse user jwt token: " + e.getMessage());
            return Optional.empty();
        }
    }
}
