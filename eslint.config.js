import js from "@eslint/js"
import globals from "globals"
import jsdoc from "eslint-plugin-jsdoc"

export default [
  {
    ignores: ["build/**", "node_modules/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node
      },
      sourceType: "module"
    },
    plugins: {
      jsdoc
    },
    rules: {
      "comma-dangle": ["error", "never"],
      "object-curly-spacing": ["error", "never"],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[optional=true]",
          message: "Do not use optional function calls (`?.()`). Call expected functions directly, or use an explicit guard for genuinely optional callbacks."
        }
      ],
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "jsdoc/check-alignment": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "error",
      "jsdoc/no-undefined-types": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-param-name": "error",
      "jsdoc/require-param-type": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-returns-type": "error"
    }
  },
  {
    files: ["spec/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jasmine
      }
    }
  }
]
