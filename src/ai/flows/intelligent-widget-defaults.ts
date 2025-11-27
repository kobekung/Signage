'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// [FIX] Add 'video' to the enum list
const SuggestWidgetDefaultsInputSchema = z.object({
  widgetType: z.enum(['text', 'clock', 'image', 'video', 'ticker', 'webview']).describe('The type of the widget.'),
});
export type SuggestWidgetDefaultsInput = z.infer<typeof SuggestWidgetDefaultsInputSchema>;

const SuggestWidgetDefaultsOutputSchema = z.object({
  properties: z.record(z.any()).describe('The suggested initial properties for the widget.'),
});
export type SuggestWidgetDefaultsOutput = z.infer<typeof SuggestWidgetDefaultsOutputSchema>;

export async function suggestWidgetDefaults(input: SuggestWidgetDefaultsInput): Promise<SuggestWidgetDefaultsOutput> {
  return suggestWidgetDefaultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWidgetDefaultsPrompt',
  input: {schema: SuggestWidgetDefaultsInputSchema},
  output: {schema: SuggestWidgetDefaultsOutputSchema},
  prompt: `You are a digital signage expert. Given the type of widget, suggest reasonable initial property values as a JSON object.\n\nWidget Type: {{{widgetType}}}\n\nRespond with a JSON object. Do not include any text outside of the JSON object.`,
});

const suggestWidgetDefaultsFlow = ai.defineFlow(
  {
    name: 'suggestWidgetDefaultsFlow',
    inputSchema: SuggestWidgetDefaultsInputSchema,
    outputSchema: SuggestWidgetDefaultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);