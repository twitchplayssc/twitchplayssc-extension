package org.camokatuk.extensionserver;

import java.util.HashMap;
import java.util.Map;

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
	private Map<Integer, PlayerStats> statsByUserId = new HashMap<>();
	private Map<String, PlayerStats> statsByUserName = new HashMap<>(); // fallback, will be eliminated

	private Map<String, Integer> displayNameToUid = new HashMap<>();

	@Autowired
	public StateManager(TwitchApi twitchApi)
	{
		this.twitchApi = twitchApi;
	}

	public void resetPlayerStats()
	{
		this.statsByUserId = new HashMap<>();
		this.statsByUserName = new HashMap<>();
	}

	public void pushPlayerStats(Map<String, PlayerStats> state)
	{
		for (Map.Entry<String, PlayerStats> stateEntry : state.entrySet())
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

	public PlayerStats getPlayerStats(String userIdString)
	{
		Integer userId = parseNumericUserId(userIdString);
		if (userId == null)
		{
			return PlayerStats.msg("Please allow the extension to identify you");
		}

		PlayerStats regularStats = statsByUserId.get(userId);
		if (regularStats != null)
		{
			return regularStats;
		}

		String userName = twitchApi.getUserDisplayName(userId);
		if (userName == null)
		{
			return PlayerStats.msg("Unable to fetch your userName, please contact admins");
		}
		else
		{
			displayNameToUid.put(userName, userId); // save user name in the cache

			PlayerStats legacyStats = statsByUserName.get(userName); // do the lookup in legacy collection
			if (legacyStats != null)
			{
				statsByUserId.put(userId, legacyStats); // save the data to the regular collection for faster lookup next time
				return legacyStats;

			}
			else // no data found for the player whatsoever, but we know them, so they're ready to join
			{
				return PlayerStats.msg("Type !play to join the game");
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
}
