package org.camokatuk.extensionserver;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.camokatuk.extensionserver.twitchapi.TwitchApi;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;

public class AutoIdUserDataContainer<D>
{
    private static final Log LOG = LogFactory.getLog(AutoIdUserDataContainer.class);
    private static final String UNAME_FLAG_PREFIX = "uname_";

    private final TwitchApi twitchApi;
    private final Map<String, Integer> displayNameToUid;

    private volatile Map<Integer, D> dataByUserId; // for active future use. also used for faster lookup
    private volatile Map<String, D> dataByUserName; // fallback, will be eliminated hopefully

    public AutoIdUserDataContainer(TwitchApi twitchApi, Map<String, Integer> displayNameToUid)
    {
        this.twitchApi = twitchApi;
        this.displayNameToUid = displayNameToUid;
        this.reset();
    }

    public void reset()
    {
        this.dataByUserId = new ConcurrentHashMap<>();
        this.dataByUserName = new ConcurrentHashMap<>();
    }

    // biifunction: (existing data, new data) -> mergedData
    public void mergeData(String someUserIdentifier, D data, BiFunction<D, D, D> reduceFn)
    {
        Integer userId;
        String userName = null;
        if (someUserIdentifier.startsWith(UNAME_FLAG_PREFIX))
        {
            userName = someUserIdentifier.substring(UNAME_FLAG_PREFIX.length()).toLowerCase();
            userId = displayNameToUid.get(userName); // can be null, since displayNameToUid is populated when user requests their stats
        }
        else
        {
            userId = Utils.parseNumericUserId(someUserIdentifier);
        }

        if (userId != null)
        {
            putOrMergeIfPresent(dataByUserId, userId, data, reduceFn);
        }
        else  // only populate statsByUserName if user id is unknown, it's a legacy and will be removed later (hopefully)
        {
            putOrMergeIfPresent(dataByUserName, userName, data, reduceFn);
        }
    }

    private <K> void putOrMergeIfPresent(Map<K, D> dataSource, K key, D newData, BiFunction<D, D, D> reduceFn)
    {
        D existingData = dataSource.get(key);
        dataSource.put(key, existingData == null ? newData : reduceFn.apply(existingData, newData));
    }

    public void setData(String someUserIdentifier, D data)
    {
        this.mergeData(someUserIdentifier, data, (oldData, newData) -> newData);
    }

    public DataOrMessage<D> getData(int userId)
    {
        D regularData = dataByUserId.get(userId);
        if (regularData != null)
        {
            return DataOrMessage.data(regularData);
        }

        String userName = twitchApi.getUserDisplayName(userId);
        if (userName == null)
        {
            return DataOrMessage.msg("Unable to fetch your userName, please contact admins");
        }
        else
        {
            displayNameToUid.put(userName, userId); // save user name in the cache

            D legacyStats = dataByUserName.get(userName); // do the lookup in legacy collection
            if (legacyStats != null)
            {
                dataByUserId.put(userId, legacyStats); // save the data to the regular collection for faster lookup next time
                return DataOrMessage.data(legacyStats);
            }
            else // no data found for the player whatsoever, but we know them, so they're ready to join
            {
                return DataOrMessage.msg("Type !play to join the game");
            }
        }
    }

}
