package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.data.Property;
import com.enonic.xp.data.PropertyArray;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.data.ValueTypes;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.security.IdProviderConfig;

public final class IdProviderConfigMapper
    implements MapSerializable
{
    private final IdProviderConfig value;

    public IdProviderConfigMapper( final IdProviderConfig value )
    {
        this.value = value;
    }

    private void serialize( final MapGenerator gen, final IdProviderConfig value )
    {
        gen.value( "applicationKey", value.getApplicationKey().getName() );
        serializeConfig( gen, value.getConfig() );
    }

    private void serializeConfig( final MapGenerator gen, final PropertyTree value )
    {
        gen.array( "config" );
        for ( final PropertyArray propertyArray : value.getRoot().getPropertyArrays() )
        {
            serializePropertyArray( gen, propertyArray );
        }
        gen.end();
    }

    private void serializePropertyArray( final MapGenerator gen, final PropertyArray value )
    {
        gen.map();
        gen.value( "name", value.getName() );
        gen.value( "type", ValueTypes.DATE_TIME.equals( value.getValueType() ) ? "Instant" : value.getValueType().getName() );
        gen.array( "values" );
        for ( final Property property : value.getProperties() )
        {
            serializeProperty( gen, property );
        }
        gen.end();
        gen.end();
    }

    private void serializeProperty( final MapGenerator gen, final Property value )
    {

        if ( value.getType().equals( ValueTypes.PROPERTY_SET ) )
        {
            final PropertySet set = value.getSet();
            if ( set != null )
            {
                gen.map();
                gen.array( "set" );
                for ( final PropertyArray propertyArray : value.getSet().getPropertyArrays() )
                {
                    serializePropertyArray( gen, propertyArray );
                }
                gen.end();
                gen.end();
            }
        }
        else
        {
            final Object v = value.getValue().getObject();
            final boolean ofNullableType =
                value.getType().equals( ValueTypes.REFERENCE ) || value.getType().equals( ValueTypes.BINARY_REFERENCE );
            if ( !ofNullableType || v != null )
            {
                gen.map();
                gen.value( "v", v );
                gen.end();
            }
        }

    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        serialize( gen, this.value );
    }
}

