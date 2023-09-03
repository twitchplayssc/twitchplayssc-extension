package org.camokatuk.extensionserver;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Data
public class UserDisplayData {
    private boolean sellout = false;
    private boolean inGame = false;
    @JsonInclude(NON_NULL)
    private PlayerInGameData inGameData;
    @JsonInclude(NON_NULL)
    private MiniMap map;
    @JsonInclude(NON_NULL)
    private String globalMessage;
    @JsonInclude(NON_NULL)
    private List<String> events;
    @JsonInclude(NON_NULL)
    private CommandCard commandCard;
    @JsonInclude(NON_NULL)
    private List<Skill> availableSkills;
    @JsonInclude(NON_NULL)
    private Integer xp;
    @JsonInclude(NON_NULL)
    private Integer levelupXp;
    @JsonInclude(NON_NULL)
    private Integer availablePoints;
    @JsonInclude(NON_NULL)
    private Double levelProgress;

    public static UserDisplayData empty() {
        return UserDisplayData.msg(null);
    }

    public static UserDisplayData msg(String msg) {
        UserDisplayData instance = new UserDisplayData();
        instance.setGlobalMessage(msg);
        return instance;
    }

    @Data
    public static class InGame {
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
        public static class Workers {
            private int minerals;
            private int gas;
            private int idle;
            private int moving;
        }
    }
}
