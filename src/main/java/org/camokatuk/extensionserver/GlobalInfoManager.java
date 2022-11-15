package org.camokatuk.extensionserver;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class GlobalInfoManager {
    private final DataByUserName<PlayerGlobalStats> playerGlobalStats = new DataByUserName<>();
    private List<Skill> availableSkills = defaultSkills();

    public void addGlobalData(UserDisplayData userDisplayData) {
        userDisplayData.setAvailableSkills(this.getAvailableSkills());
    }

    public void acceptStatsFromServer(Map<String, PlayerGlobalStats> newStats) {
        playerGlobalStats.replaceData(newStats);
    }

    public Optional<PlayerGlobalStats> get(String username) {
        return playerGlobalStats.getData(username);
    }

    public void registerSkillLevelUpLocally(String username, int skillId) {
        playerGlobalStats.getData(username).ifPresent(stats -> stats.levelUpSkill(skillId));
    }

    public void setAvailableSkills(List<Skill> skills) {
        availableSkills = skills;
    }

    public List<Skill> getAvailableSkills() {
        return availableSkills;
    }

    public int getNumberOfSkills() {
        return availableSkills.size();
    }

    // hardcoded default skills so it doesn't shit the bed as much when the server's restarted
    private static List<Skill> defaultSkills() {
        int DEFAULT_MAX_SKILL = 12;
        String DEFAULT_DESCRIPTION = "Hang on, the server's restarting, fetching skills...";
        return Arrays.asList(
                new Skill("micro", "micro", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("attack", "attack", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("defense", "defense", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("detection", "detection", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("blink", "blink", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("storm", "storm", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("sentry", "sentry", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("phoenix", "phoenix", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("nova", "nova", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("macro", "macro", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("raven", "raven", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("yamato", "yamato", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("liberator", "liberator", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("stim", "stim", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("ghost", "ghost", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("", "", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("bile", "bile", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("queen", "queen", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("infestor", "infestor", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("viper", "viper", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL),
                new Skill("burrow", "I haven't loaded skills yet ok jeez", DEFAULT_DESCRIPTION, DEFAULT_MAX_SKILL)
        );
    }

    public void addXpData(String username, UserDisplayData userDisplayData) {
        playerGlobalStats.getData(username).ifPresent(stats -> {
            userDisplayData.setLevelupXp(stats.getLevelupXp());
            userDisplayData.setXp(stats.getXp());
            userDisplayData.setLevelProgress(stats.getLevelProgress());
        });
    }
}
