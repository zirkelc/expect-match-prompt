import { describe, expect, test } from 'vitest';
import { createMatchPrompt } from '../src/matcher.js';

expect.extend({
  toMatchPrompt: createMatchPrompt({
    model: {
      provider: 'openai',
      modelId: 'gpt-4o',
      settings: { apiKey: process.env.OPENAI_API_KEY },
    },
  }),
});

describe('toMatchPrompt', () => {
  test('should match language', async () => {
    await expect('Hi, how are you?').toMatchPrompt('it should be English');
    await expect('Hallo, wie geht es dir?').toMatchPrompt(
      'it should be German',
    );
    await expect('Bonjour, comment ça va?').toMatchPrompt(
      'it should be French',
    );
  });

  test('should match sentiment', async () => {
    await expect("I'm happy today").toMatchPrompt('it should be positive');
    await expect("I'm sad today").toMatchPrompt('it should be negative');
  });
});
