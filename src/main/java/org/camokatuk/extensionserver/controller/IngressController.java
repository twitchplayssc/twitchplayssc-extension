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
public class IngressController {
    private final StateManager stateManager;
    private final PlayerEventManager playerEventManager;
    private final GlobalInfoManager globalInfoManager;
    private final ExtensionStateManager extensionStateManager;
    private final String superSecretKey;
    private final boolean sendDebugData;

    @Autowired
    public IngressController(StateManager stateManager, PlayerEventManager playerEventManager,
                             GlobalInfoManager globalInfoManager,
                             ExtensionStateManager extensionStateManager,
                             @Value("${extension.ingress.password}") String superSecretKey,
                             @Value("${extension.ingress.bullshitdata:false}") boolean sendDebugData) {
        this.stateManager = stateManager;
        this.playerEventManager = playerEventManager;
        this.globalInfoManager = globalInfoManager;
        this.extensionStateManager = extensionStateManager;
        this.superSecretKey = superSecretKey;
        this.sendDebugData = sendDebugData;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/playerstats")
    public
    @ResponseBody
    ResponseEntity<String> pushStats(@RequestBody Map<String, PlayerInGameData> state, @RequestHeader(value = "Authentication") String ohWowSecurity) {
        if (isNotAuthorizedRequest(ohWowSecurity)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        stateManager.pushResources(state);
        return ResponseEntity.ok("OK");
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/state")
    public
    @ResponseBody
    ResponseEntity<String> resetStats(@RequestBody GameStateContainer gameStateContainer,
                                      @RequestHeader(value = "Authentication") String ohWowSecurity) {
        if (isNotAuthorizedRequest(ohWowSecurity)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        stateManager.pushGameState(gameStateContainer);
        return ResponseEntity.ok("OK");
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/event")
    public
    @ResponseBody
    ResponseEntity<String> receiveEvent(@RequestBody Map<String, List<String>> eventsByUserIds,
                                        @RequestHeader(value = "Authentication") String ohWowSecurity) {
        if (isNotAuthorizedRequest(ohWowSecurity)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        stateManager.pushEvents(eventsByUserIds);
        return ResponseEntity.ok("OK");
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/playerevents")
    public
    @ResponseBody
    ResponseEntity<ExtensionFeedbackResponse> exchangeControlPanelData(@RequestBody Map<String, PlayerGlobalStats> eventsByUserIds,
                                                                       @RequestHeader(value = "Authentication") String ohWowSecurity) {
        if (isNotAuthorizedRequest(ohWowSecurity)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        globalInfoManager.acceptStatsFromServer(eventsByUserIds);
        ExtensionFeedbackResponse extensionFeedbackResponse = new ExtensionFeedbackResponse();
        Map<String, PlayerGeneratedEvents> userFeedback = sendDebugData
                ? playerEventManager.fakeEvents()
                : playerEventManager.collectAndDropEvents();
        extensionFeedbackResponse.setUserFeedback(userFeedback);
        boolean serverJustStarted = sendDebugData || extensionStateManager.isJustStarted();
        extensionFeedbackResponse.setEbsRestarted(serverJustStarted);
        return ResponseEntity.ok(extensionFeedbackResponse);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/globalsettings")
    public
    @ResponseBody
    ResponseEntity<String> acceptGlobalSettings(@RequestBody GlobalSettingsRequest globalSettingsRequest,
                                                @RequestHeader(value = "Authentication") String ohWowSecurity) {
        if (isNotAuthorizedRequest(ohWowSecurity)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        globalInfoManager.setAvailableSkills(globalSettingsRequest.getSkills());
        extensionStateManager.markCriticalDataReceived();
        return ResponseEntity.ok("OK");
    }

    private boolean isNotAuthorizedRequest(String authHeader) {
        return !superSecretKey.equals(authHeader);
    }
}