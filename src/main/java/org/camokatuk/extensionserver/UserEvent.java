package org.camokatuk.extensionserver;

import lombok.Data;

@Data
public class UserEvent {
    private String text;
    private String copyText;
    private ClipboardToken clipToken;
    private int lifetime;
}
