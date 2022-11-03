package org.camokatuk.extensionserver;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class Utils
{
    private static final Log LOG = LogFactory.getLog(Utils.class);

    public static Integer parseNumericUserId(String str)
    {
        try
        {
            return Integer.parseInt(str);
        }
        catch (NumberFormatException e)
        {
            LOG.warn("Could not parse neither user id nor username from the key: " + str);
            return null;
        }
    }
}
