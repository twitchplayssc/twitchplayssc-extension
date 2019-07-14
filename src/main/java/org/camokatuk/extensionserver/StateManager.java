package org.camokatuk.extensionserver;

import java.util.Collections;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class StateManager
{
	private Map<String, PlayerStats> state = Collections.emptyMap();

	public void renewState(Map<String, PlayerStats> state)
	{
		this.state = state;
	}

	public PlayerStats getPlayerStats(String userId)
	{
		return state.get(userId);
	}
}
