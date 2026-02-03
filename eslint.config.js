import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'app',
    stylistic: true,
    formatters: true,
  },
  {
    rules: {
      'no-console': 'off',
    },
  },
)
