import { describe, expect, test } from 'vitest';
import { toMatchPrompt } from '../src/matcher.js';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

expect.extend({
  toMatchPrompt,
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
  }, 10_000);

  test('should match sentiment', async () => {
    await expect("I'm happy today").toMatchPrompt('it should be positive');
    await expect("I'm sad today").toMatchPrompt('it should be negative');
  });
});
