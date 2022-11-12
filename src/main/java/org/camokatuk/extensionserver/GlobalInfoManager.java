package org.camokatuk.extensionserver;

import lombok.AllArgsConstructor;
import org.camokatuk.extensionserver.twitchapi.TwitchApi;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@AllArgsConstructor
public class GlobalInfoManager
{
    private final TwitchApi twitchApi;
    private final Map<String, PlayerGlobalStats> playerGlobalStats = new ConcurrentHashMap<>();

    public void acceptStatsFromServer(Map<String, PlayerGlobalStats> newStats)
    {
        playerGlobalStats.putAll(newStats);
    }

    public PlayerGlobalStats get(String username)
    {
        return playerGlobalStats.get(username);
    }

    public int getNumberOfSkills()
    {
        return 21;
    }

    public void levelUpSkill(String username, int skillId)
    {
        Optional.ofNullable(playerGlobalStats.get(username)).ifPresent(stats -> stats.levelUpSkill(skillId));
    }
}
