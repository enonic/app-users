var t = require('/lib/xp/testing');
var endpoint = require('/extensions/section-endpoint');

var CONTEXT = '/admin/com.enonic.xp.app.settings/main/_/admin:extension/com.enonic.xp.app.users:users';

function request(path, body) {
    return {rawPath: CONTEXT + path, contextPath: CONTEXT, body: body};
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

exports.reportsAnUnknownFieldAsAGraphQlError = function () {
    var response = graphql('{ nothingHere }');

    t.assertEquals(200, response.status);
    t.assertNotNull(response.body.errors);
};

exports.rejectsABodyThatIsNotAQuery = function () {
    t.assertEquals(400, endpoint.post(request('/graphql', '{"nope":1}')).status);
};
