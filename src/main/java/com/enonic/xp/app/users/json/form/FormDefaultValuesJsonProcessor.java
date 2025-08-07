package com.enonic.xp.app.users.json.form;

import com.enonic.xp.data.Value;
import com.enonic.xp.form.*;
import com.enonic.xp.inputtype.InputTypes;

import java.util.Iterator;

import static com.enonic.xp.form.FormItemType.*;

final class FormDefaultValuesJsonProcessor
{

    static void setDefaultValues( final Form form, final FormJson formJson )
    {
        processFormItems( form, formJson.getFormItems() );
    }

    private static void processFormItems( final Iterable<FormItem> formItems, final Iterable<FormItemJson> formItemsJson )
    {
        final Iterator<FormItem> formItemsIt = formItems.iterator();
        final Iterator<FormItemJson> formItemsJsonIt = formItemsJson.iterator();
        while ( formItemsIt.hasNext() && formItemsJsonIt.hasNext() )
        {
            final FormItem formItem = formItemsIt.next();
            final FormItemJson formItemJson = formItemsJsonIt.next();

            if ( formItem.getType() == INPUT )
            {
                final Input input = formItem.toInput();
                final InputJson inputJson = (InputJson) formItemJson;
                if ( input.getDefaultValue() != null )
                {
                    try
                    {
                        final Value defaultValue = InputTypes.BUILTIN.resolve( input.getInputType() ).
                            createDefaultValue( input );
                        if ( defaultValue != null )
                        {
                            inputJson.setDefaultValue( defaultValue );
                        }
                    }
                    catch ( IllegalArgumentException ex )
                    {
                        // DO NOTHING
                    }
                }
            }
            else if ( formItem.getType() == FORM_ITEM_SET )
            {
                processFormItems( formItem.toFormItemSet(), ( (FormItemSetJson) formItemJson ).getItems() );
            }
            else if ( formItem.getType() == LAYOUT && formItem.toLayout() instanceof FieldSet )
            {
                processFormItems( (FieldSet) formItem, ( (FieldSetJson) formItemJson ).getItems() );
            }
            else if ( formItem.getType() == FORM_OPTION_SET )
            {
                final Iterator<FormOptionSetOption> formOptionSetOptionIt = formItem.toFormOptionSet().iterator();
                final Iterator<FormOptionSetOptionJson> formOptionSetOptionJsonIt =
                    ( (FormOptionSetJson) formItemJson ).getOptions().iterator();

                while ( formOptionSetOptionIt.hasNext() && formOptionSetOptionJsonIt.hasNext() )
                {
                    final FormOptionSetOption formOptionSetOption = formOptionSetOptionIt.next();
                    final FormOptionSetOptionJson formOptionSetOptionJson = formOptionSetOptionJsonIt.next();

                    processFormItems( formOptionSetOption, formOptionSetOptionJson.getItems() );
                }
            }
        }
    }
}
