package org.camokatuk.extensionserver;

import java.util.Map;

public class CommandCard
{
    public String top;
    public String right;
    public String width;
    public String height;
    public int widthCells;
    public int heightCells;
    public boolean debugBorder;
    public Map<String, CommandCardCell> cells;

    public static class CommandCardCell
    {
        public String copyText;
        public ClipboardToken clipToken;
        public String tip;

        public static class ClipboardToken
        {
            public String attr;
            public String[] combo;
        }
    }
}
