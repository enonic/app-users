/**
 * Created on 6/30/2017.
 */
module.exports = {
    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    generateRandomNumber: function () {
        return Math.round(Math.random() * 1000000);
    },
    generateEmail: function (userName) {
        return userName + '@gmail.com'
    },
    buildIdProvider(displayName, description, authAppName, permissions) {
        return {
            displayName: displayName,
            description: description,
            authAppName: authAppName,
            permissions: permissions,
        };
    },
    buildUser(displayName, password, email, roles) {
        return {
            displayName: displayName,
            password: password,
            email: email,
            roles: roles,
        };
    },
    buildRole(displayName, description, members) {
        return {
            displayName: displayName,
            description: description,
            members: members,
        };
    },
    buildGroup(displayName, description, members, roles) {
        return {
            displayName: displayName,
            description: description,
            members: members,
            roles: roles,
        };
    },
};
