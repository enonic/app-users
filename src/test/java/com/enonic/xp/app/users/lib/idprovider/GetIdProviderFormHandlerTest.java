package com.enonic.xp.app.users.lib.idprovider;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.form.FieldSet;
import com.enonic.xp.form.Form;
import com.enonic.xp.form.FormItemSet;
import com.enonic.xp.form.FormOptionSet;
import com.enonic.xp.form.FormOptionSetOption;
import com.enonic.xp.form.Input;
import com.enonic.xp.form.Occurrences;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorMode;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.inputtype.InputTypeName;
import com.enonic.xp.testing.ScriptTestSupport;
import com.enonic.xp.util.GenericValue;

public class GetIdProviderFormHandlerTest
    extends ScriptTestSupport
{
    private static final String SCRIPT = "/com/enonic/xp/app/users/lib/idprovider/getIdProviderForm-test.js";

    private static final ApplicationKey APP = ApplicationKey.from( "com.enonic.app.oidc" );

    private static final Locale NORWEGIAN = Locale.forLanguageTag( "no" );

    private IdProviderDescriptorService descriptorService;

    private LocaleService localeService;

    @Override
    public void initialize()
        throws Exception
    {
        super.initialize();
        this.descriptorService = Mockito.mock( IdProviderDescriptorService.class );
        this.localeService = Mockito.mock( LocaleService.class );
        addService( IdProviderDescriptorService.class, this.descriptorService );
        addService( LocaleService.class, this.localeService );
    }

    @Test
    public void testForm()
    {
        final MessageBundle norwegian =
            bundle( Map.of( "clientId.label", "Klient-ID", "clientId.help", "Fra leverandøren", "scope.openid", "Kun OpenID" ) );
        Mockito.when( descriptorService.getDescriptor( APP ) ).thenReturn( descriptor( form() ) );
        Mockito.when( localeService.getSupportedLocale( List.of( NORWEGIAN ), APP ) ).thenReturn( NORWEGIAN );
        Mockito.when( localeService.getBundle( APP, NORWEGIAN ) ).thenReturn( norwegian );

        runFunction( SCRIPT, "getForm" );
    }

    @Test
    public void testUntranslated()
    {
        final MessageBundle empty = bundle( Map.of() );
        Mockito.when( descriptorService.getDescriptor( APP ) ).thenReturn( descriptor( form() ) );
        Mockito.when( localeService.getBundle( APP, null ) ).thenReturn( empty );

        runFunction( SCRIPT, "getUntranslatedForm" );
    }

    @Test
    public void testNoForm()
    {
        Mockito.when( descriptorService.getDescriptor( APP ) ).thenReturn( descriptor( Form.empty() ) );

        runFunction( SCRIPT, "getEmptyForm" );
    }

    @Test
    public void testNoDescriptor()
    {
        runFunction( SCRIPT, "getMissingForm" );
    }

    private static IdProviderDescriptor descriptor( final Form form )
    {
        return IdProviderDescriptor.create().key( APP ).mode( IdProviderDescriptorMode.EXTERNAL ).config( form ).build();
    }

    private static Form form()
    {
        final Input clientId = Input.create()
            .name( "clientId" )
            .label( "Client ID" )
            .labelI18nKey( "clientId.label" )
            .helpText( "From the provider" )
            .helpTextI18nKey( "clientId.help" )
            .inputType( InputTypeName.TEXT_LINE )
            .occurrences( 1, 1 )
            .inputTypeProperty( "maxLength", GenericValue.numberValue( 64 ) )
            .build();

        final Input scope = Input.create()
            .name( "scope" )
            .label( "Scope" )
            .inputType( InputTypeName.COMBO_BOX )
            .occurrences( 0, 0 )
            .inputTypeProperty( "options", GenericValue.newList()
                .add( GenericValue.newObject()
                          .put( "value", "openid" )
                          .put( "label", GenericValue.newObject().put( "text", "OpenID only" ).put( "i18n", "scope.openid" ).build() )
                          .build() )
                .add( GenericValue.newObject().put( "value", "email" ).put( "label", "Email" ).build() )
                .build() )
            .build();

        final FieldSet claims = FieldSet.create()
            .label( "Claims" )
            .addFormItem( Input.create().name( "claim" ).label( "Claim" ).inputType( InputTypeName.TEXT_LINE ).build() )
            .build();

        final FormItemSet endpoints = FormItemSet.create()
            .name( "endpoints" )
            .label( "Endpoints" )
            .occurrences( 0, 2 )
            .addFormItem( Input.create().name( "url" ).label( "URL" ).inputType( InputTypeName.TEXT_LINE ).build() )
            .build();

        final FormOptionSet mode = FormOptionSet.create()
            .name( "mode" )
            .label( "Mode" )
            .expanded( true )
            .occurrences( Occurrences.create( 1, 1 ) )
            .multiselection( Occurrences.create( 1, 1 ) )
            .addOptionSetOption( FormOptionSetOption.create().name( "code" ).label( "Code" ).defaultOption( true ).build() )
            .addOptionSetOption( FormOptionSetOption.create()
                                     .name( "implicit" )
                                     .label( "Implicit" )
                                     .addFormItem(
                                         Input.create().name( "nonce" ).label( "Nonce" ).inputType( InputTypeName.CHECK_BOX ).build() )
                                     .build() )
            .build();

        return Form.create().addFormItem( clientId ).addFormItem( scope ).addFormItem( claims ).addFormItem( endpoints ).addFormItem(
            mode ).build();
    }

    private static MessageBundle bundle( final Map<String, String> phrases )
    {
        final MessageBundle bundle = Mockito.mock( MessageBundle.class );
        Mockito.when( bundle.localize( ArgumentMatchers.anyString() ) ).thenAnswer( call -> phrases.get( call.getArgument( 0, String.class ) ) );
        return bundle;
    }
}
