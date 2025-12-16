package com.enonic.xp.app.users.json.form;

import java.time.Instant;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.enonic.xp.data.Value;

public class PropertyValueJson
{
    @JsonProperty("value")
    private final Object value;

    @JsonProperty("type")
    private final String type;

    PropertyValueJson( final Value value )
    {
        this.value = value.getObject();
        if ( Instant.class.isAssignableFrom( value.getType().getJavaType() ) )
        {
            this.type = "Instant";
        }
        else if ( LocalDateTime.class.isAssignableFrom( value.getType().getJavaType() ) )
        {
            this.type = "DateTime";
        }
        else
        {
            this.type = value.getType().getName();
        }
    }

    public Object getValue()
    {
        return value;
    }

    public String getType()
    {
        return type;
    }
}
