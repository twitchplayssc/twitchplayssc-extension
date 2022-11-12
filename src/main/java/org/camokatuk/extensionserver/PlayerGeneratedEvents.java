package org.camokatuk.extensionserver;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
public class PlayerGeneratedEvents {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private int[] levelups;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object polls;
}
