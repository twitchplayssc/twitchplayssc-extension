package org.camokatuk.extensionserver.twitchapi;

public class UserData {
    public Data[] data;

    public static class Data {
        public int id;
        public String login;
        public String display_name;
    }
}
