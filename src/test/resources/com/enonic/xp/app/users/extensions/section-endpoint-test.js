var t = require('/lib/xp/testing');
var endpoint = require('/extensions/section-endpoint');

var CONTEXT = '/admin/com.enonic.xp.app.settings/main/_/admin:extension/com.enonic.xp.app.users:users';

function request(path, body) {
    return {rawPath: CONTEXT + path, contextPath: CONTEXT, body: body, params: {}};
}

function graphql(query) {
    return endpoint.post(request('/graphql', JSON.stringify({query: query})));
}

exports.servesStaticAsText = function () {
    var response = endpoint.get(request('/_static/probe.js'));

    t.assertEquals(200, response.status);
    t.assertEquals('text/javascript; charset=utf-8', response.contentType);
    t.assertEquals('export const probe = true;\n', response.body);
};

exports.answers404ForAbsentStatic = function () {
    t.assertEquals(404, endpoint.get(request('/_static/absent.js')).status);
};

exports.buildsTheSchemaAndAnswersConfig = function () {
    var response = graphql('{ config { appId appVersion } }');

    t.assertEquals(200, response.status);
    t.assertNull(response.body.errors);
    t.assertNotNull(response.body.data.config.appId);
    t.assertNotNull(response.body.data.config.appVersion);
};

// The bundle behind this is a mock (ScriptTestSupport has no LocaleService), so what it pins is the
// wiring, not the phrases: that `Json` survives GraalJS as a readable map rather than reaching the
// client as a host object, and that the `locale` argument arrives at the resolver.
exports.answersPhrasesAsAReadableJsonMap = function () {
    var response = graphql('{ phrases(locale: "no") }');

    t.assertEquals(200, response.status);
    t.assertNull(response.body.errors);
    t.assertEquals('Brukere', response.body.data.phrases['section.users.title']);
};

// Introspection, so no data service has to be stubbed: what this pins is that the principals
// slice is wired into the schema graphql-java actually built, root fields and mutations alike.
exports.exposesThePrincipalsSchema = function () {
    // ! One root per request: graphql-java refuses a document naming `__Type.fields` more than
    // ! once ("not asking for introspection in good faith"), so the two cannot be asked together.
    var queries = graphql('{ __schema { queryType { fields { name } } } }');
    var mutations = graphql('{ __schema { mutationType { fields { name } } } }');

    t.assertNull(queries.body.errors);
    t.assertNull(mutations.body.errors);

    t.assertEquals('', missingFrom(queries.body.data.__schema.queryType.fields,
        ['config', 'phrases', 'users', 'roles', 'groups', 'idProviders', 'idProviderApplications',
            'repositories']));

    t.assertEquals('', missingFrom(mutations.body.data.__schema.mutationType.fields,
        ['createUser', 'updateUser', 'createGroup', 'createRole', 'createIdProvider',
            'updateIdProvider', 'deleteIdProviders', 'deletePrincipals']));
};

// Names the fields that are absent, so a failure says which rather than just `false`. Written with
// index access because graphql-java hands back host lists, which carry no JS array methods.
function missingFrom(fields, expected) {
    var present = {};
    for (var i = 0; i < fields.length; i++) {
        present[fields[i].name] = true;
    }

    var missing = [];
    for (var j = 0; j < expected.length; j++) {
        if (!present[expected[j]]) {
            missing.push(expected[j]);
        }
    }

    return missing.join(', ');
}

exports.reportsAnUnknownFieldAsAGraphQlError = function () {
    var response = graphql('{ nothingHere }');

    t.assertEquals(200, response.status);
    t.assertNotNull(response.body.errors);
};

exports.rejectsABodyThatIsNotAQuery = function () {
    t.assertEquals(400, endpoint.post(request('/graphql', '{"nope":1}')).status);
};

// The test context carries no roles, which is the case that matters: the sections are open wider than
// the report is, so the refusal has to come from the report's own gate on the engine XP runs it on.
exports.refusesAPermissionReportWithoutTheAdminRole = function () {
    t.assertEquals(403, endpoint.get(request('/report')).status);
};
