package org.camokatuk.extensionserver;

import lombok.Data;

@Data
public class PlayerGlobalStats
{
    private String level;
    private int xp;
    private int levelupXp;
    private int levelProgress;
    private int[] skills;
    private int availablePoints;

    public synchronized void levelUpSkill(int skillId)
    {
        if (availablePoints > 0)
        {
            skills[skillId] += 1;
            availablePoints -= 1;
        }
    }
}
