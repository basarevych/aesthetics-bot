/**
 * Repo-saved application configuration
 */
module.exports = {
    // Project name (alphanumeric)
    project: 'aestheticsbot',

    // Load base classes and services, path names
    autoload: [
        '!arpen/src',
        'models',
        'repositories',
        'commands',
    ],
};
