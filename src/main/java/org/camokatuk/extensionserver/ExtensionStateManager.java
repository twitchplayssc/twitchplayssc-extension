package org.camokatuk.extensionserver;

import org.springframework.stereotype.Component;

@Component
public class ExtensionStateManager {
    private volatile boolean justStarted = true;

    public void markCriticalDataReceived() {
        justStarted = false;
    }

    public boolean isJustStarted() {
        return justStarted;
    }
}
