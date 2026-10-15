package com.enonic.xp.app.users.lib.idprovider;

import java.util.List;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.data.Value;
import com.enonic.xp.data.ValueFactory;
import com.enonic.xp.data.ValueType;
import com.enonic.xp.data.ValueTypes;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.IdProviderConfig;

/** Reads back what {@link IdProviderConfigMapper} writes, keeping every declared `ValueType`. */
public final class ScriptValueToIdProviderConfigTranslator
{
    private ScriptValueToIdProviderConfigTranslator()
    {
    }

    public static IdProviderConfig translate( final ScriptValue value )
    {
        final ScriptValue applicationKey = value.getMember( "applicationKey" );
        final ScriptValue config = value.getMember( "config" );

        return IdProviderConfig.create()
            .applicationKey( applicationKey == null ? null : ApplicationKey.from( applicationKey.getValue( String.class ) ) )
            .config( config == null ? null : toPropertyTree( config.getArray() ) )
            .build();
    }

    private static PropertyTree toPropertyTree( final List<ScriptValue> propertyArrays )
    {
        final PropertyTree tree = new PropertyTree();

        for ( final ScriptValue propertyArray : propertyArrays )
        {
            addPropertyArray( propertyArray, tree.getRoot() );
        }

        return tree;
    }

    private static void addPropertyArray( final ScriptValue propertyArray, final PropertySet parent )
    {
        final String name = propertyArray.getMember( "name" ).getValue( String.class );
        final ValueType type = ValueTypes.getByName( propertyArray.getMember( "type" ).getValue( String.class ) );
        final List<ScriptValue> values = propertyArray.getMember( "values" ).getArray();

        // An empty `values` is a property present with no value — the null `Reference` the mapper left out.
        if ( values.isEmpty() )
        {
            addProperty( null, type, name, parent );
            return;
        }

        for ( final ScriptValue value : values )
        {
            addProperty( value, type, name, parent );
        }
    }

    private static void addProperty( final ScriptValue propertyValue, final ValueType type, final String name, final PropertySet parent )
    {
        parent.addProperty( name, type.equals( ValueTypes.PROPERTY_SET )
            ? toSetValue( propertyValue, parent )
            : toValue( propertyValue, type ) );
    }

    private static Value toSetValue( final ScriptValue propertyValue, final PropertySet parent )
    {
        if ( propertyValue == null || !propertyValue.hasMember( "set" ) )
        {
            return ValueFactory.newPropertySet( null );
        }

        final PropertySet set = parent.getTree().newSet();

        for ( final ScriptValue propertyArray : propertyValue.getMember( "set" ).getArray() )
        {
            addPropertyArray( propertyArray, set );
        }

        return ValueFactory.newPropertySet( set );
    }

    private static Value toValue( final ScriptValue propertyValue, final ValueType type )
    {
        final ScriptValue member = propertyValue == null ? null : propertyValue.getMember( "v" );
        return type.fromJsonValue( member == null ? null : member.getValue() );
    }
}
