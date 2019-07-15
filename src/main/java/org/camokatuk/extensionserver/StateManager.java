package org.camokatuk.extensionserver;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.camokatuk.extensionserver.twitchapi.TwitchApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class StateManager
{
	private static final String UNAME_FLAG_PREFIX = "uname_";

	private final TwitchApi twitchApi;
	private Map<Integer, PlayerStats> statsByPlayer = new HashMap<>();
	private Map<String, Integer> displayNameToUid = new HashMap<>();

	@Autowired
	public StateManager(TwitchApi twitchApi)
	{
		this.twitchApi = twitchApi;
	}

	public void resetPlayerStats()
	{
		this.statsByPlayer = new HashMap<>();
	}

	public void pushPlayerStats(Map<String, PlayerStats> state)
	{
		this.statsByPlayer.putAll(this.processState(state));
	}

	private Map<Integer, PlayerStats> processState(Map<String, PlayerStats> state)
	{
		return state.entrySet().stream().collect(Collectors.toMap(this::processKey, Map.Entry::getValue));
	}

	private int processKey(Map.Entry<String, PlayerStats> playerStats)
	{
		String userKey = playerStats.getKey();
		if (userKey.startsWith(UNAME_FLAG_PREFIX))
		{
			return displayNameToUid.get(userKey.substring(UNAME_FLAG_PREFIX.length()));
		}
		else
		{
			return Integer.parseInt(userKey);
		}
	}

	public PlayerStats getPlayerStats(int userId)
	{
		String userName = twitchApi.getUserDisplayName(userId);
		displayNameToUid.put(userName, userId);
		return statsByPlayer.get(userId);
	}
}
