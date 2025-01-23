import {
  type OpenAIProviderSettings,
  createOpenAI,
  openai,
} from '@ai-sdk/openai';
import type { OpenAIChatModelId } from '@ai-sdk/openai/internal';
import type { RawMatcherFn, SyncExpectationResult } from '@vitest/expect';
import { format, plugins } from '@vitest/pretty-format';
import { type LanguageModelV1, Output, generateObject } from 'ai';
import { z } from 'zod';

const formatOptions = {
  plugins: Object.values(plugins),
};

const schema = z.object({
  pass: z.boolean(),
  message: z.string(),
  actual: z.any(),
  expected: z.any(),
});

const experimental_output = Output.object({ schema });

const system = `You are a test assertion evaluator.
Your job is to determine if a received value matches the expected value, where the expected value might be natural language descriptions or prompt-like instructions.

For example, if the received value is "Hello, how are you?" and the expected value is "text in English", it should match since the expectation matches the received value.

Focus on these aspects when evaluating:

1. Intent matching:
   - Match the core requirement even if expressed differently
   - "in German" matches "should be German" or "must be written in German"
   - "contains a price" matches "should include the cost" or "must show the price"

2. Language and content requirements:
   - Language specifications (e.g., "in German", "written in Spanish")
   - Content requirements (e.g., "contains a price", "includes a date")
   - Style requirements (e.g., "formal tone", "friendly message")

3. Flexibility in phrasing:
   - Accept different ways of expressing the same requirement
   - Don't be strict about exact wording
   - Focus on the core meaning rather than specific phrasing

Respond with:
- pass: boolean indicating if the requirements match
- message: clear explanation of why they match or don't match
- actual: the received value
- expected: the expected value

When requirements don't match, explain specifically what aspect differs.`;

const prompt = (received: unknown, expected: unknown) => `
Received:
${format(received, formatOptions)}

Expected:
${format(expected, formatOptions)}`;

type OpenAIStructuredOutput<T> = T extends `o1${string}` ? never : T;

type MatchPromptOptions = {
  debug?: boolean;
  model:
    | LanguageModelV1
    | {
        provider: 'openai';
        modelId: OpenAIStructuredOutput<OpenAIChatModelId>;
        settings?: OpenAIProviderSettings;
      };
};

/**
 * Create a matcher that uses an AI model to evaluate if a `received value` matches an `expected value`.
 */
export const createMatchPrompt = (
  options: MatchPromptOptions,
): RawMatcherFn => {
  const debug = options.debug ?? false;
  const model =
    'doGenerate' in options.model
      ? options.model
      : options.model.provider === 'openai'
        ? createOpenAI(options.model.settings)(options.model.modelId)
        : undefined;

  if (!model) throw new Error('Invalid model');

  const matcher: RawMatcherFn = async function (
    this,
    received,
    expected,
  ): Promise<SyncExpectationResult> {
    const { matcherHint, printReceived, printExpected } = this.utils;

    const {
      object: result,
      request,
      response,
    } = await generateObject({
      model,
      system,
      schema,
      prompt: prompt(received, expected),
      temperature: 0,
    });

    if (debug) {
      console.dir({ result, request, response }, { depth: null });
    }

    return {
      ...result,
      message: () => result.message,
    };
  };

  return matcher;
};

/**
 * Matcher to evaluate if a `received value` matches an `expected value`.
 * This matcher uses `gpt-4o-mini-2024-07-18` as model.
 * Use `createMatchPrompt` to create a matcher with a different model.
 */
export const toMatchPrompt = createMatchPrompt({
  model: openai('gpt-4o-mini-2024-07-18'),
});
