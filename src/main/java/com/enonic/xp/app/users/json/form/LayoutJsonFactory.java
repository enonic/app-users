package com.enonic.xp.app.users.json.form;

import com.enonic.xp.app.users.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.form.FieldSet;

@SuppressWarnings("UnusedDeclaration")
public class LayoutJsonFactory
{
    public static FormItemJson create( final FieldSet layout, final LocaleMessageResolver localeMessageResolver )
    {
            return new FieldSetJson( layout, localeMessageResolver );
    }
}
