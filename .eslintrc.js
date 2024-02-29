module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "plugins": [
        "@typescript-eslint",
        "prettier", 
        "jest"
    ],
    rules: {
        /* Prefer === to == and !== to !=, but only warn */
        eqeqeq: 'warn',
        /* Prefer ; use, but only warn (prettier will fix) */
        semi: 'warn',
        /* Allow console.*() */
        'no-console': 'off',
        /* Allow debugger; */
        'no-debugger': 'off',
        /* Warn when using blocking alert, prompt, etc, but allow */
        'no-alert': 'warn',
        /* Warn when using an unnecessary } else { after a return */
        'no-else-return': 'warn',
        /* Ignore variables not declared at top of scope */
        'vars-on-top': 'off',
        /* Don't bother checking linebreaks, prettier will fix */
        'linebreak-style': 'off'
      }
};
