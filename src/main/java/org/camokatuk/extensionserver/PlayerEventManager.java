package org.camokatuk.extensionserver;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
@AllArgsConstructor
public class PlayerEventManager
{
    private final GlobalInfoManager globalInfoManager;
    private final Queue<LevelUpEvent> levelUpBuffer = new ConcurrentLinkedQueue<>();
    private final Map<String, Long> usersOnline = new ConcurrentHashMap<>(); //username to last seen timestamp

    public void userOnline(String username)
    {
        usersOnline.put(username, System.currentTimeMillis());
    }

    public void levelUpSkill(String username, int skillId)
    {
        levelUpBuffer.offer(new LevelUpEvent(username, skillId));
        globalInfoManager.levelUpSkill(username, skillId);
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
            PlayerGeneratedEvents allUserEvents = result.getOrDefault(levelUpEvent.username, new PlayerGeneratedEvents());
            int[] levelups = allUserEvents.getLevelups();
            if (levelups == null)
            {
                levelups = new int[globalInfoManager.getNumberOfSkills()];
                allUserEvents.setLevelups(levelups);
            }
            levelups[levelUpEvent.skillId] += 1;
            result.putIfAbsent(levelUpEvent.username, allUserEvents);
        }

        // online events
        for (String username : usersOnline.keySet())
        {
            result.putIfAbsent(username, new PlayerGeneratedEvents());
        }
        return result;
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
        private final String username;
        private final int skillId;
    }
}
