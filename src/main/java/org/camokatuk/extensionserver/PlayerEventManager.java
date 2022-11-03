package org.camokatuk.extensionserver;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.camokatuk.extensionserver.twitchapi.TwitchApi;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
@AllArgsConstructor
public class PlayerEventManager
{
    private final GlobalInfoManager globalInfoManager;
    private final TwitchApi twitchApi;
    private final Queue<LevelUpEvent> levelUpBuffer = new ConcurrentLinkedQueue<>();
    private final Map<Integer, Long> usersOnline = new ConcurrentHashMap<>();

    public void userOnline(String userIdString)
    {
        Integer userId = Utils.parseNumericUserId(userIdString);
        usersOnline.put(userId, System.currentTimeMillis());
    }

    public void levelUpSkill(String userIdString, int skillId)
    {
        Integer userId = Utils.parseNumericUserId(userIdString);
        if (userId != null)
        {
            levelUpBuffer.offer(new LevelUpEvent(userId, skillId));
        }
        globalInfoManager.levelUpSkill(userId, skillId);
    }

    public Map<String, PlayerGeneratedEvents> fakeEvents()
    {
        levelUpSkill("59393023", 0);
        levelUpSkill("59393023", 0);
        levelUpSkill("59393023", 14);
        levelUpSkill("59393023", 17);

        userOnline("77080650");

        return collectAndDropEvents();
    }

    public Map<String, PlayerGeneratedEvents> collectAndDropEvents()
    {
        Map<String, PlayerGeneratedEvents> result = new HashMap<>();
        List<LevelUpEvent> allLevelUpEvents = collectAndDropAll(levelUpBuffer);

        // level up events
        for (LevelUpEvent levelUpEvent : allLevelUpEvents)
        {
            String userKey = toUnameKey(levelUpEvent.userId);
            PlayerGeneratedEvents allUserEvents = result.getOrDefault(userKey, new PlayerGeneratedEvents());
            int[] levelups = allUserEvents.getLevelups();
            if (levelups == null)
            {
                levelups = new int[globalInfoManager.getNumberOfSkills()];
                allUserEvents.setLevelups(levelups);
            }
            levelups[levelUpEvent.skillId] += 1;
            result.putIfAbsent(userKey, allUserEvents);
        }

        // online events
        for (int playerId : usersOnline.keySet())
        {
            String userKey = toUnameKey(playerId);
            result.putIfAbsent(userKey, new PlayerGeneratedEvents());
        }
        return result;
    }

    private String toUnameKey(int userId)
    {
        return "uname_" + twitchApi.getUserDisplayName(userId);
    }

    private <E> List<E> collectAndDropAll(Queue<E> queue)
    {
        int currentLength = queue.size();
        List<E> allEvents = new ArrayList<>(currentLength);
        for (int i = 0; i < currentLength; i++) // needs limit to not get stuck polling quickly arriving events
        {
            E nextElement = queue.poll();
            if (nextElement == null) // can happen if called in parallel with itself
            {
                break;
            }
            allEvents.add(nextElement);
        }
        return allEvents;
    }

    @Data
    private static class LevelUpEvent
    {
        private final int userId;
        private final int skillId;
    }
}
