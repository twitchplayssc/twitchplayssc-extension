package org.camokatuk.extensionserver;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
@AllArgsConstructor
public class GlobalInfoManager
{
    private final DataByUserName<PlayerGlobalStats> playerGlobalStats = new DataByUserName<>();

    public void acceptStatsFromServer(Map<String, PlayerGlobalStats> newStats)
    {
        playerGlobalStats.replaceData(newStats);
    }

    public Optional<PlayerGlobalStats> get(String username)
    {
        return playerGlobalStats.getData(username);
    }

    public int getNumberOfSkills()
    {
        return 21;
    }

    public void registerSkillLevelUpLocally(String username, int skillId)
    {
        playerGlobalStats.getData(username).ifPresent(stats -> stats.levelUpSkill(skillId));
    }
}
