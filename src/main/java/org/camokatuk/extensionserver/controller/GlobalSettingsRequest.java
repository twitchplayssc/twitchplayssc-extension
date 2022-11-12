package org.camokatuk.extensionserver.controller;

import lombok.Data;
import org.camokatuk.extensionserver.Skill;

import java.util.List;

@Data
public class GlobalSettingsRequest {
    private List<Skill> skills;
}
