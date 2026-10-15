package com.enonic.xp.app.users.lib.idprovider;

import java.util.Objects;

import com.enonic.xp.data.Property;
import com.enonic.xp.data.PropertyArray;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.data.ValueTypes;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.security.IdProviderConfig;

/**
 * The provider's application binding and its configuration, as `{name, type, values}` triples.
 *
 * ! The shape carries the `ValueType` of every property on purpose, and that is what a plain map cannot
 * ! do: XP's own `lib/xp/auth` writes a config with `PropertyTree.fromMap`, which infers types from the
 * ! JS values and so turns a `Reference` into a `String` and a `GeoPoint` into text. An id provider's
 * ! config is filled from the schema form its application declares, so the types have to survive the
 * ! round trip — hence this codec, and `ScriptValueToIdProviderConfigTranslator` reading it back.
 *
 * Two absences in it are load-bearing and pinned by `*-test.js`: a null value of a nullable type — a
 * `Reference`, a `BinaryReference` — is left out of `values` entirely, while a null of any other type
 * stays as an empty entry, because the bridge drops a null from a map but keeps the map itself.
 */
public final class IdProviderConfigMapper
    implements MapSerializable
{
    private final IdProviderConfig idProviderConfig;

    public IdProviderConfigMapper( final IdProviderConfig idProviderConfig )
    {
        this.idProviderConfig = idProviderConfig;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "applicationKey", Objects.toString( idProviderConfig.getApplicationKey(), null ) );
        serializeConfig( gen, idProviderConfig.getConfig() );
    }

    private void serializeConfig( final MapGenerator gen, final PropertyTree config )
    {
        gen.array( "config" );

        if ( config != null )
        {
            for ( final PropertyArray propertyArray : config.getRoot().getPropertyArrays() )
            {
                serializePropertyArray( gen, propertyArray );
            }
        }

        gen.end();
    }

    private void serializePropertyArray( final MapGenerator gen, final PropertyArray propertyArray )
    {
        gen.map();
        gen.value( "name", propertyArray.getName() );
        gen.value( "type", propertyArray.getValueType().getName() );
        gen.array( "values" );

        for ( final Property property : propertyArray.getProperties() )
        {
            serializeProperty( gen, property );
        }

        gen.end();
        gen.end();
    }

    private void serializeProperty( final MapGenerator gen, final Property property )
    {
        if ( property.getType().equals( ValueTypes.PROPERTY_SET ) )
        {
            serializeSet( gen, property.getSet() );
            return;
        }

        final Object value = property.getValue().getObject();

        if ( value == null && isNullable( property ) )
        {
            return;
        }

        gen.map();
        gen.value( "v", value );
        gen.end();
    }

    private void serializeSet( final MapGenerator gen, final PropertySet set )
    {
        if ( set == null )
        {
            return;
        }

        gen.map();
        gen.array( "set" );

        for ( final PropertyArray propertyArray : set.getPropertyArrays() )
        {
            serializePropertyArray( gen, propertyArray );
        }

        gen.end();
        gen.end();
    }

    private boolean isNullable( final Property property )
    {
        return property.getType().equals( ValueTypes.REFERENCE ) || property.getType().equals( ValueTypes.BINARY_REFERENCE );
    }
}
