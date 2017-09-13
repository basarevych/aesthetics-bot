/**
 * Repo-saved application configuration
 */
module.exports = {
    // Project name (alphanumeric)
    project: 'aestheticsbot',

    // Load base classes and services, path names
    autoload: [
        '!arpen/src/models',
        '!arpen/src/repositories',
        '!arpen/src/services',
        'models',
        'repositories',
        'services',
        'commands',
    ],
};
