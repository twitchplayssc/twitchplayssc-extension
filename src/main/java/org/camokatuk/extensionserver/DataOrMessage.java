package org.camokatuk.extensionserver;

import lombok.Data;

@Data
public class DataOrMessage<D>
{
    private D data;
    private String message;

    public static <D> DataOrMessage<D> data(D data)
    {
        DataOrMessage<D> dDataOrMessage = new DataOrMessage<>();
        dDataOrMessage.setData(data);
        return dDataOrMessage;
    }

    public static <D> DataOrMessage<D> msg(String msg)
    {
        DataOrMessage<D> dDataOrMessage = new DataOrMessage<>();
        dDataOrMessage.setMessage(msg);
        return dDataOrMessage;
    }
}
