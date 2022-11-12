package org.camokatuk.extensionserver;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;

public class DataByUserName<D>
{
    private volatile Map<String, D> dataByUserName;

    public void reset()
    {
        this.dataByUserName = new ConcurrentHashMap<>();
    }

    // biifunction: (existing data, new data) -> mergedData
    public void mergeData(String username, D data, BiFunction<D, D, D> reduceFn)
    {
        String userName = username.toLowerCase();
        putOrMergeIfPresent(dataByUserName, userName, data, reduceFn);
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

    public DataOrMessage<D> getData(String username)
    {
        if (username == null)
        {
            return DataOrMessage.msg("Unable to fetch your userName, please contact admins");
        }

        D legacyStats = dataByUserName.get(username); // do the lookup in legacy collection
        if (legacyStats != null)
        {
            return DataOrMessage.data(legacyStats);
        }
        else // no data found for the player whatsoever, but we know them, so they're ready to join
        {
            return DataOrMessage.msg("Type !play to join the game");
        }
    }

}
