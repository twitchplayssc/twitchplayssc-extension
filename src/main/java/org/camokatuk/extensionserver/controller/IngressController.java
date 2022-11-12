package org.camokatuk.extensionserver.controller;

import org.camokatuk.extensionserver.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class IngressController
{
    private final StateManager stateManager;
    private final PlayerEventManager playerEventManager;
    private final GlobalInfoManager globalInfoManager;
    private final String superSecretKey;

    @Autowired
    public IngressController(StateManager stateManager, PlayerEventManager playerEventManager,
                             GlobalInfoManager globalInfoManager,
                             @Value("${extension.ingress.password}") String superSecretKey)
    {
        this.stateManager = stateManager;
        this.playerEventManager = playerEventManager;
        this.globalInfoManager = globalInfoManager;
        this.superSecretKey = superSecretKey;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/playerstats")
    public
    @ResponseBody
    String pushStats(@RequestBody Map<String, UserGameState> state, @RequestHeader(value = "Authentication") String ohWowSecurity)
    {
        if (isNotAuthorizedRequest(ohWowSecurity))
        {
            return "Nope";
        }

        stateManager.pushResources(state);
        return "OK";
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/state")
    public
    @ResponseBody
    String resetStats(@RequestBody GameStateContainer gameStateContainer,
                      @RequestHeader(value = "Authentication") String ohWowSecurity)
    {
        if (isNotAuthorizedRequest(ohWowSecurity))
        {
            return "Nope";
        }

        stateManager.pushGameState(gameStateContainer);
        return "OK";
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/event")
    public
    @ResponseBody
    String receiveEvent(@RequestBody Map<String, List<String>> eventsByUserIds,
                        @RequestHeader(value = "Authentication") String ohWowSecurity)
    {
        if (isNotAuthorizedRequest(ohWowSecurity))
        {
            return "Nope";
        }

        stateManager.pushEvents(eventsByUserIds);
        return "OK";
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/playerevents")
    public
    @ResponseBody
    ResponseEntity<Map<String, PlayerGeneratedEvents>> exchangeControlPanelData(@RequestBody Map<String, PlayerGlobalStats> eventsByUserIds,
                                                                                @RequestHeader(value = "Authentication") String ohWowSecurity)
    {
        if (isNotAuthorizedRequest(ohWowSecurity))
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        globalInfoManager.acceptStatsFromServer(eventsByUserIds);
//        return ResponseEntity.ok(playerEventManager.collectAndDropEvents());
        return ResponseEntity.ok(playerEventManager.fakeEvents());
    }

    private boolean isNotAuthorizedRequest(String authHeader)
    {
        return !superSecretKey.equals(authHeader);
    }
}