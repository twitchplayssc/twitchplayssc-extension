package org.camokatuk.extensionserver;

import lombok.Data;

import java.util.List;

@Data
public class UserDisplayData
{
    private boolean sellout = false;
    private UserGameState state;
    private MiniMap map;
    private LeaderboardData leaderboard;
    private String globalMessage;
    private List<String> events;
    private CommandCard commandCard;

    public static UserDisplayData empty()
    {
        return UserDisplayData.msg(null);
    }

    public static UserDisplayData msg(String msg)
    {
        UserDisplayData instance = new UserDisplayData();
        instance.setGlobalMessage(msg);
        return instance;
    }

    @Data
    public static class InGame
    {
        private boolean sellout = false;
        private int gas;
        private int minerals;
        private int terrazine;
        private int gasIncome;
        private int mineralsIncome;
        private int gasTax;
        private int mineralsTax;
        private int stance;
        private String supply;
        private String feeding;
        private Workers workers;
        private MiniMap map = new MiniMap();

        @Data
        public static class Workers
        {
            private int minerals;
            private int gas;
            private int idle;
            private int moving;
        }
    }

    public static class LeaderboardData
    {
        /* TODO */
    }
}
