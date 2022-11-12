package org.camokatuk.extensionserver;

import lombok.NonNull;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;

public class DataByUserName<D>
{
    private volatile Map<String, D> dataByUserName = new ConcurrentHashMap<>();
    ;

    public void reset()
    {
        this.dataByUserName = new ConcurrentHashMap<>();
    }

    public void replaceData(Map<String, D> multipleUsersData)
    {
        for (Map.Entry<String, D> userEntry : multipleUsersData.entrySet())
        {
            replaceData(userEntry.getKey(), userEntry.getValue());
        }
    }

    public void replaceData(String username, D data)
    {
        String userName = username.toLowerCase();
        putOrMergeIfPresent(dataByUserName, userName, data, (oldData, newData) -> newData);
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
        this.replaceData(someUserIdentifier, data);
    }

    public Optional<D> getData(@NonNull String username)
    {
        return Optional.ofNullable(dataByUserName.get(username));
    }

}
