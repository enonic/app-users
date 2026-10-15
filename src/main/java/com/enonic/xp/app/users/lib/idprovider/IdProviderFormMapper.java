package com.enonic.xp.app.users.lib.idprovider;

import java.util.Map;

import com.enonic.xp.form.FieldSet;
import com.enonic.xp.form.Form;
import com.enonic.xp.form.FormItem;
import com.enonic.xp.form.FormItemSet;
import com.enonic.xp.form.FormOptionSet;
import com.enonic.xp.form.FormOptionSetOption;
import com.enonic.xp.form.Input;
import com.enonic.xp.form.Occurrences;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.schema.LocalizedText;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.util.GenericValue;

/**
 * An id provider's config form in the dialect `@enonic/ui-types` names `FormJson`, with every label and help
 * text already in the admin's language.
 *
 * ! Not `lib-schema`'s serializer, which it otherwise follows: that one writes an input's config properties
 * ! straight onto the input, where `Form.fromJson` never looks, and leaves every label untranslated. The
 * ! labels can only be translated here — the bundle is the provider application's, not this one's.
 *
 * No `FormFragment` case: the descriptor service refuses a provider form that holds one.
 */
public final class IdProviderFormMapper
    implements MapSerializable
{
    private final Form form;

    private final MessageBundle bundle;

    public IdProviderFormMapper( final Form form, final MessageBundle bundle )
    {
        this.form = form;
        this.bundle = bundle;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.array( "form" );
        serializeItems( gen, form );
        gen.end();
    }

    private void serializeItems( final MapGenerator gen, final Iterable<FormItem> items )
    {
        for ( final FormItem item : items )
        {
            switch ( item )
            {
                case Input input -> serializeInput( gen, input );
                case FormItemSet itemSet -> serializeItemSet( gen, itemSet );
                case FieldSet fieldSet -> serializeLayout( gen, fieldSet );
                case FormOptionSet optionSet -> serializeOptionSet( gen, optionSet );
                default ->
                {
                }
            }
        }
    }

    private void serializeInput( final MapGenerator gen, final Input input )
    {
        gen.map();
        gen.value( "formItemType", "Input" );
        gen.value( "name", input.getName() );
        gen.value( "label", localize( input.getLabelI18nKey(), input.getLabel() ) );
        gen.value( "helpText", localize( input.getHelpTextI18nKey(), input.getHelpText() ) );
        gen.value( "inputType", input.getInputType().toString() );
        serializeOccurrences( gen, "occurrences", input.getOccurrences() );
        serializeConfig( gen, input.getInputTypeConfig() );
        gen.end();
    }

    private void serializeItemSet( final MapGenerator gen, final FormItemSet itemSet )
    {
        gen.map();
        gen.value( "formItemType", "ItemSet" );
        gen.value( "name", itemSet.getName() );
        gen.value( "label", localize( itemSet.getLabelI18nKey(), itemSet.getLabel() ) );
        gen.value( "helpText", localize( itemSet.getHelpTextI18nKey(), itemSet.getHelpText() ) );
        serializeOccurrences( gen, "occurrences", itemSet.getOccurrences() );
        gen.array( "items" );
        serializeItems( gen, itemSet );
        gen.end();
        gen.end();
    }

    private void serializeLayout( final MapGenerator gen, final FieldSet fieldSet )
    {
        gen.map();
        gen.value( "formItemType", "Layout" );
        gen.value( "label", localize( fieldSet.getLabelI18nKey(), fieldSet.getLabel() ) );
        gen.array( "items" );
        serializeItems( gen, fieldSet );
        gen.end();
        gen.end();
    }

    private void serializeOptionSet( final MapGenerator gen, final FormOptionSet optionSet )
    {
        gen.map();
        gen.value( "formItemType", "OptionSet" );
        gen.value( "name", optionSet.getName() );
        gen.value( "label", localize( optionSet.getLabelI18nKey(), optionSet.getLabel() ) );
        gen.value( "helpText", localize( optionSet.getHelpTextI18nKey(), optionSet.getHelpText() ) );
        gen.value( "expanded", optionSet.isExpanded() );
        serializeOccurrences( gen, "occurrences", optionSet.getOccurrences() );
        serializeOccurrences( gen, "selection", optionSet.getMultiselection() );
        gen.array( "options" );
        for ( final FormOptionSetOption option : optionSet )
        {
            serializeOption( gen, option );
        }
        gen.end();
        gen.end();
    }

    private void serializeOption( final MapGenerator gen, final FormOptionSetOption option )
    {
        gen.map();
        gen.value( "name", option.getName() );
        gen.value( "label", localize( option.getLabelI18nKey(), option.getLabel() ) );
        gen.value( "helpText", localize( option.getHelpTextI18nKey(), option.getHelpText() ) );
        gen.value( "default", option.isDefaultOption() );
        gen.array( "items" );
        serializeItems( gen, option );
        gen.end();
        gen.end();
    }

    private void serializeOccurrences( final MapGenerator gen, final String name, final Occurrences occurrences )
    {
        gen.map( name );
        gen.value( "minimum", occurrences.getMinimum() );
        gen.value( "maximum", occurrences.getMaximum() );
        gen.end();
    }

    private void serializeConfig( final MapGenerator gen, final GenericValue config )
    {
        gen.map( "config" );
        for ( final Map.Entry<String, GenericValue> property : config.properties() )
        {
            if ( "options".equals( property.getKey() ) )
            {
                serializeOptions( gen, property.getValue() );
            }
            else
            {
                gen.value( property.getKey(), property.getValue().toRawJs() );
            }
        }
        gen.end();
    }

    // The one place a config carries text for people: a ComboBox or RadioButton option label, which may be
    // `{ text, i18n }` rather than a string.
    private void serializeOptions( final MapGenerator gen, final GenericValue options )
    {
        gen.array( "options" );
        for ( final GenericValue option : options.values() )
        {
            if ( option.getType() != GenericValue.Type.OBJECT )
            {
                gen.value( option.toRawJs() );
                continue;
            }

            gen.map();
            for ( final Map.Entry<String, GenericValue> entry : option.properties() )
            {
                if ( "label".equals( entry.getKey() ) )
                {
                    final LocalizedText label = LocalizedText.from( entry.getValue() );
                    gen.value( "label", localize( label.i18n(), label.text() ) );
                }
                else
                {
                    gen.value( entry.getKey(), entry.getValue().toRawJs() );
                }
            }
            gen.end();
        }
        gen.end();
    }

    private String localize( final String key, final String text )
    {
        if ( bundle == null || key == null || key.isBlank() )
        {
            return text;
        }

        final String localized = bundle.localize( key );
        return localized != null ? localized : text;
    }
}
