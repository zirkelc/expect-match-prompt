# `expect.toMatchPrompt()`

AI prompt matcher for testing with [Vitest](https://vitest.dev/) and [Jest](https://jestjs.io/).

## Install

Install `expect-match-prompt` as a dev dependency.

```bash
npm add -D expect-match-prompt
```

## Usage

Import `toMatchPrompt` and use [`expect.extend`](https://vitest.dev/api/expect.html#expect-extend) to extend default matchers.

> [!IMPORTANT]  
> The `toMatchPrompt` matcher is an asynchronous operation, so it's important to `await` expectation.

```ts
import { describe, expect, test } from 'vitest';
import { toMatchPrompt } from 'expect-match-prompt';

expect.extend({ toMatchPrompt });

describe('toMatchPrompt', () => {
  test('should match type of languages', async () => {
    await expect('Hi, how are you?').toMatchPrompt('it should be English');
    await expect('Hallo, wie geht es dir?').toMatchPrompt('it should be German');
    await expect('Bonjour, comment ça va?').toMatchPrompt('it should be French');
  });
});
```

The `toMatchPrompt` matcher uses OpenAI's `gpt-4o-mini-2024-07-18` model by default. Make sure to set the `OPENAI_API_KEY` environment variable.

If you want to use a different model or provider, you can create a new matcher using `createMatchPrompt`.

```ts
import { describe, expect, test } from 'vitest';
import { createMatchPrompt } from 'expect-match-prompt';

const toMatchPrompt = createMatchPrompt({
  model: {
    provider: 'openai',
    modelId: 'gpt-4-turbo', 
    settings: { apiKey: 'sk-...' }, 
  },
});

expect.extend({ toMatchPrompt });

describe('toMatchPrompt', () => {
  /* ... */
});
```

## API

### `toMatchPrompt(prompt: string)`
Default matcher with OpenAI's `gpt-4o-mini-2024-07-18` model.

### `createMatchPrompt(options: CreateMatchPromptOptions)`
Create a new matcher with a different model or provider.
The `model` accepts a plain object or an instance of a [LanguageModelV1](https://sdk.ai/docs/reference/language-model-v1) from one of the [supported providers](https://sdk.vercel.ai/providers/ai-sdk-providers) of [AI SDK](https://sdk.vercel.ai/).

```ts
// Plain object
const toMatchPrompt = createMatchPrompt({
  model: {
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    settings: { apiKey: 'sk-...' },
  },
});

// AI SDK LanguageModelV1
import { anthropic } from '@ai-sdk/anthropic';

const toMatchPrompt = createMatchPrompt({
  model: anthropic('claude-3-haiku-20240307'),
});

```

## License

MIT
