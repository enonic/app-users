module.exports = {
    'extends': [
        'airbnb-base/legacy'
    ],
    'plugins': [],
    'rules': {
        'indent': ['error', 4],
        'comma-dangle': ['error', 'never'],
        'no-underscore-dangle': ['off'],
        'func-names': ['off'],
        'max-len': ['error', 120],
        'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
        'vars-on-top': 'off'
    },
    'env': {
        'node': true
    },
    'globals': {
        'resolve': false,
        'log': true,
        'app': true
    }
};
