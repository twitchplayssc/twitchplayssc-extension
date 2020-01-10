package org.camokatuk.extensionserver;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.camokatuk.extensionserver.twitchapi.TwitchApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class StateManager
{
	private static final Log LOG = LogFactory.getLog(StateManager.class);

	private static final String UNAME_FLAG_PREFIX = "uname_";

	private final TwitchApi twitchApi;
	private volatile Map<Integer, UserDisplayData> statsByUserId;
	private volatile Map<String, UserDisplayData> statsByUserName; // fallback, will be eliminated

	private volatile Map<String, Integer> displayNameToUid = new ConcurrentHashMap<>();

	private volatile GameStateContainer gameState = new GameStateContainer();

	@Autowired
	public StateManager(TwitchApi twitchApi)
	{
		this.twitchApi = twitchApi;
		this.resetPlayerStats();
	}

	private void resetPlayerStats()
	{
		this.statsByUserId = new ConcurrentHashMap<>();
		this.statsByUserName = new ConcurrentHashMap<>();
	}

	public void pushPlayerStats(Map<String, UserDisplayData> state)
	{
		// if the extension server was just restarted or somehow we didn't get the initial push from the bot
		// and yet we're receiving players' data, we should update the global state to INGAME.
		// it could be a sellout game, which would imply INGAME_SELLOUT, but the chances of that are low,
		// and we shouldn't be restarting the extension server during the sellout games in the first place.
		// we can always fix this by pushing INGAME_SELLOUT manually.
		boolean stateIsNotInGame = this.gameState == null || GameState.isNotInGame(this.gameState.getState());
		if (state != null && !state.isEmpty() && stateIsNotInGame)
		{
			this.gameState = GameStateContainer.inGame();
		}

		for (Map.Entry<String, UserDisplayData> stateEntry : state.entrySet())
		{
			String userKey = stateEntry.getKey();
			Integer userId;
			String userName = null;
			if (userKey.startsWith(UNAME_FLAG_PREFIX))
			{
				userName = userKey.substring(UNAME_FLAG_PREFIX.length()).toLowerCase();
				userId = displayNameToUid.get(userName); // can be null, since displayNameToUid is populated when user requests their stats
			}
			else
			{
				userId = parseNumericUserId(userKey);
			}

			if (userId != null)
			{
				statsByUserId.put(userId, stateEntry.getValue());
			}
			else  // only populate statsByUserName if user id is unknown, it's a legacy and will be removed later (hopefully)
			{
				statsByUserName.put(userName, stateEntry.getValue());
			}
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
			UserDisplayData displayData = this.getInGameDisplayData(userIdString);
			if (displayData.getInGame() != null)
			{
				displayData.getInGame().setSellout(this.gameState.getState() == GameState.INGAME_SELLOUT);
			}
			return displayData;
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
			return UserDisplayData.msg(null);
		}
		else if (this.gameState.getState() == GameState.LEADERBOARDS)
		{
			return UserDisplayData.msg(null);
		}
		else
		{
			return UserDisplayData.msg(null);
		}
	}

	private UserDisplayData getInGameDisplayData(String userIdString)
	{
		Integer userId = parseNumericUserId(userIdString);
		if (userId == null)
		{
			return UserDisplayData.msg("Please allow the extension to identify you");
		}

		UserDisplayData regularStats = statsByUserId.get(userId);
		if (regularStats != null)
		{
			return regularStats;
		}

		String userName = twitchApi.getUserDisplayName(userId);
		if (userName == null)
		{
			return UserDisplayData.msg("Unable to fetch your userName, please contact admins");
		}
		else
		{
			displayNameToUid.put(userName, userId); // save user name in the cache

			UserDisplayData legacyStats = statsByUserName.get(userName); // do the lookup in legacy collection
			if (legacyStats != null)
			{
				statsByUserId.put(userId, legacyStats); // save the data to the regular collection for faster lookup next time
				return legacyStats;

			}
			else // no data found for the player whatsoever, but we know them, so they're ready to join
			{
				return UserDisplayData.msg("Type !play to join the game");
			}
		}
	}

	private static Integer parseNumericUserId(String str)
	{
		try
		{
			return Integer.parseInt(str);
		}
		catch (NumberFormatException e)
		{
			LOG.warn("Could not parse neither user id nor username from the key: " + str);
			return null;
		}
	}

	public GameStateContainer getCurrentState()
	{
		return this.gameState;
	}
}
