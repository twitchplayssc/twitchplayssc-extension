package org.camokatuk.extensionserver;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.camokatuk.extensionserver.twitchapi.TwitchApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static org.camokatuk.extensionserver.AutoIdUserDataContainer.parseNumericUserId;

@Component
public class StateManager
{
	private static final Log LOG = LogFactory.getLog(StateManager.class);

	private final AutoIdUserDataContainer<UserGameState> resources;
	private final AutoIdUserDataContainer<List<String>> events;

	private volatile GameStateContainer gameState = new GameStateContainer();

	@Autowired
	public StateManager(TwitchApi twitchApi)
	{
		Map<String, Integer> displayNameToUid = new ConcurrentHashMap<>();
		this.resources = new AutoIdUserDataContainer<>(twitchApi, displayNameToUid);
		this.events = new AutoIdUserDataContainer<>(twitchApi, displayNameToUid);
		this.resetPlayerStats();
	}

	private void resetPlayerStats()
	{
		this.resources.reset();
		this.events.reset();
	}

	public void pushResources(Map<String, UserGameState> state)
	{
		if (state == null)
		{
			LOG.warn("Got null state map, what the hell");
			return;
		}

		// if the extension server was just restarted or somehow we didn't get the initial push from the bot
		// and yet we're receiving players' data, we should update the global state to INGAME.
		// it could be a sellout game, which would imply INGAME_SELLOUT, but the chances of that are low,
		// and we shouldn't be restarting the extension server during the sellout games in the first place.
		// we can always fix this by pushing INGAME_SELLOUT manually.
		boolean stateIsNotInGame = this.gameState == null || GameState.isNotInGame(this.gameState.getState());
		if (!state.isEmpty() && stateIsNotInGame)
		{
			this.gameState = GameStateContainer.inGame();
		}

		for (Map.Entry<String, UserGameState> stateEntry : state.entrySet())
		{
			this.resources.setData(stateEntry.getKey(), stateEntry.getValue());
		}
	}

	public void pushGameState(GameStateContainer gameState)
	{
		this.gameState = gameState;
		if (GameState.isNotInGame(gameState.getState()))
		{
			this.resetPlayerStats();
		}
	}

	public UserDisplayData getDisplayData(String userIdString)
	{
		if (GameState.isInGame(this.gameState.getState()))
		{
			return this.getInGameDisplayData(userIdString);
		}
		else if (this.gameState.getState() == GameState.BROKEN)
		{
			return UserDisplayData.msg(this.gameState.getMessage());
		}
		else if (this.gameState.getState() == GameState.STARTINGEXTENSION)
		{
			return UserDisplayData.msg("(Re)loading extension...");
		}
		else if (this.gameState.getState() == GameState.STARTINGSTREAM)
		{
			return UserDisplayData.empty();
		}
		else if (this.gameState.getState() == GameState.LEADERBOARDS)
		{
			return UserDisplayData.empty();
		}
		else
		{
			return UserDisplayData.empty();
		}
	}

	private UserDisplayData getInGameDisplayData(String userIdString)
	{
		Integer userId = parseNumericUserId(userIdString);
		if (userId == null)
		{
			return UserDisplayData.msg(null);
		}

		DataOrMessage<UserGameState> resourcesOrMessage = resources.getData(userId);
		if (resourcesOrMessage.getMessage() != null)
		{
			return UserDisplayData.msg(resourcesOrMessage.getMessage());
		}

		// *** validations have passed, userId is cached, resourcesOrMessage has resources
		UserDisplayData displayData = new UserDisplayData();
		displayData.setState(resourcesOrMessage.getData());
		displayData.setMap(this.gameState.getMap());
		displayData.setSellout(this.gameState.getState() == GameState.INGAME_SELLOUT);
		displayData.setEvents(events.getData(userId).getData()); // see *** above, fetching the data directly is safe
		events.setData(userIdString, new ArrayList<>()); // reset the events data, now they are buffered on FE
		return displayData;
	}

	public GameStateContainer getCurrentState()
	{
		return this.gameState;
	}

	public void pushEvents(Map<String, List<String>> eventsBySomeUserIdentifiers)
	{
		eventsBySomeUserIdentifiers.forEach((key, value) ->
		{
			// simply add all events to the ones we already have
			events.mergeData(key, value, (l1, l2) -> {
				l1.addAll(l2);
				return l1;
			});
		});
	}
}
