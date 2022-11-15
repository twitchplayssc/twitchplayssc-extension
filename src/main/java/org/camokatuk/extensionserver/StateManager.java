package org.camokatuk.extensionserver;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class StateManager {
    private static final Log LOG = LogFactory.getLog(StateManager.class);

    private final DataByUserName<PlayerInGameData> resources = new DataByUserName<>();
    private final DataByUserName<List<String>> events = new DataByUserName<>();

    private volatile GameStateContainer gameState = new GameStateContainer();

    public StateManager() {
        this.resetPlayerStats();
    }

    private void resetPlayerStats() {
        this.resources.reset();
        this.events.reset();
    }

    public void pushResources(Map<String, PlayerInGameData> state) {
        if (state == null) {
            LOG.warn("Got null state map, what the hell");
            return;
        }

        // if the extension server was just restarted or somehow we didn't get the initial push from the bot
        // and yet we're receiving players' data, we should update the global state to INGAME.
        // it could be a sellout game, which would imply INGAME_SELLOUT, but the chances of that are low,
        // and we shouldn't be restarting the extension server during the sellout games in the first place.
        // we can always fix this by pushing INGAME_SELLOUT manually.
        boolean stateIsNotInGame = this.gameState == null || GameState.isNotInGame(this.gameState.getState());
        if (!state.isEmpty() && stateIsNotInGame) {
            this.gameState = GameStateContainer.inGame();
        }

        for (Map.Entry<String, PlayerInGameData> stateEntry : state.entrySet()) {
            this.resources.setData(stateEntry.getKey(), stateEntry.getValue());
        }
    }

    public void pushGameState(GameStateContainer gameState) {
        this.gameState = gameState;
        if (GameState.isNotInGame(gameState.getState())) {
            this.resetPlayerStats();
        }
    }

    public UserDisplayData getDisplayData(String username, boolean fetchGlobalGameData) {
        if (GameState.isInGame(this.gameState.getState())) {
            return this.getInGameDisplayData(username, fetchGlobalGameData);
        } else if (this.gameState.getState() == GameState.BROKEN) {
            return UserDisplayData.msg(this.gameState.getMessage());
        } else if (this.gameState.getState() == GameState.STARTINGEXTENSION) {
            return UserDisplayData.msg("(Re)loading extension...");
        } else if (this.gameState.getState() == GameState.STARTINGSTREAM) {
            return UserDisplayData.empty();
        } else if (this.gameState.getState() == GameState.LEADERBOARDS) {
            return UserDisplayData.empty();
        } else {
            return UserDisplayData.empty();
        }
    }

    private UserDisplayData getInGameDisplayData(String username, boolean fetchGlobalGameData) {
        if (username == null) {
            return UserDisplayData.msg("Unable to fetch your userName, please contact admins");
        }

        UserDisplayData displayData = new UserDisplayData();
        Optional<PlayerInGameData> stats = resources.getData(username); // do the lookup in legacy collection
        if (stats.isPresent()) {
            displayData.setInGameData(stats.get());
            if (fetchGlobalGameData) {
                displayData.setMap(this.gameState.getMap());
                displayData.setCommandCard(this.gameState.getCommandCard());
            }
        } else {
            displayData.setGlobalMessage("Type !play to join the game");
        }

        // *** validations have passed, userId is cached, we have at least some user data
        displayData.setInGame(this.gameState.getState().isInGame());
        displayData.setSellout(this.gameState.getState() == GameState.INGAME_SELLOUT);
        displayData.setEvents(events.getData(username).orElse(null)); // see *** above, fetching the data directly is safe
        events.setData(username, new ArrayList<>()); // reset the events data, now they are buffered on FE
        return displayData;
    }

    public GameStateContainer getCurrentState() {
        return this.gameState;
    }

    public void pushEvents(Map<String, List<String>> eventsByUsername) {
        eventsByUsername.forEach((key, value) ->
        {
            // simply add all events to the ones we already have
            events.mergeData(key, value, (l1, l2) ->
            {
                l1.addAll(l2);
                return l1;
            });
        });
    }
}
