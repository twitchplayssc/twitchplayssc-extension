package org.camokatuk.extensionserver;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Skill {
    private String shortName;
    private String name;
    private String description;
    private int maxPoints;
}
