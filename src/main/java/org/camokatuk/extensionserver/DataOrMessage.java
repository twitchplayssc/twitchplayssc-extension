package org.camokatuk.extensionserver;

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

    public D getData()
    {
        return data;
    }

    public void setData(D data)
    {
        this.data = data;
    }

    public String getMessage()
    {
        return message;
    }

    public void setMessage(String message)
    {
        this.message = message;
    }
}
