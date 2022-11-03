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

    public PlayerGlobalStats get(int userId)
    {
        return playerGlobalStats.get(toUnameKey(userId));
    }

    private String toUnameKey(int userId)
    {
        return "uname_" + twitchApi.getUserDisplayName(userId);
    }

    public int getNumberOfSkills()
    {
        return 21;
    }

    public void levelUpSkill(int userId, int skillId)
    {
        String userKey = toUnameKey(userId);
        Optional.ofNullable(playerGlobalStats.get(userKey)).ifPresent(stats -> stats.levelUpSkill(skillId));
    }
}
