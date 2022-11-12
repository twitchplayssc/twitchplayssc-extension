package org.camokatuk.extensionserver;

import lombok.Data;

import java.util.Map;

@Data
public class ExtensionFeedbackResponse {
    private Map<String, PlayerGeneratedEvents> userFeedback;
    private Boolean ebsRestarted;
}
