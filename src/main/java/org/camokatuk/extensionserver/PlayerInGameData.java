package org.camokatuk.extensionserver;

import lombok.Data;

import java.util.Map;

@Data
public class PlayerInGameData {
    private int gas;
    private int minerals;
    private int terrazine;
    private int gasIncome;
    private int mineralsIncome;
    private int gasTax;
    private int mineralsTax;
    private String stance;
    private String focus;
    private String supply;
    private String feeding;
    private Workers workers;
    private Map<Integer, Integer> army;
    private int race; // p t z -> 1 2 3

    @Data
    public static class Workers {
        private int minerals;
        private int gas;
        private int idle;
        private int moving;
    }
}
