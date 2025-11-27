'use server';

/**
 * @fileOverview An AI agent that suggests initial property values for widgets based on their type.
 *
 * - suggestWidgetDefaults - A function that suggests initial property values for widgets.
 * - SuggestWidgetDefaultsInput - The input type for the suggestWidgetDefaults function.
 * - SuggestWidgetDefaultsOutput - The return type for the suggestWidgetDefaults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWidgetDefaultsInputSchema = z.object({
  widgetType: z.enum(['text', 'clock', 'image', 'video', 'ticker', 'webview']).describe('The type of the widget.'),
});
export type SuggestWidgetDefaultsInput = z.infer<typeof SuggestWidgetDefaultsInputSchema>;

// [FIX] แก้ไข Schema ให้ระบุ field ทั้งหมดที่เป็นไปได้ เพื่อแก้ปัญหา "should be non-empty for OBJECT type" ของ Gemini API
const SuggestWidgetDefaultsOutputSchema = z.object({
  properties: z.object({
    // Common / Text
    content: z.string().optional(),
    color: z.string().optional(),
    fontSize: z.number().optional(),
    
    // Clock
    showSeconds: z.boolean().optional(),
    format: z.enum(['12h', '24h']).optional(),
    
    // Image / Video / Webview
    url: z.string().optional(),
    fitMode: z.enum(['cover', 'contain', 'fill']).optional(),
    playlist: z.array(z.object({
        id: z.string().optional(),
        url: z.string().optional(),
        type: z.enum(['image', 'video']).optional(),
        duration: z.number().optional(),
    })).optional(),
    
    // Ticker
    text: z.string().optional(),
    direction: z.enum(['left', 'right', 'up', 'down']).optional(),
    speed: z.number().optional(),
    textColor: z.string().optional(),
    backgroundColor: z.string().optional(),
  }).describe('The suggested initial properties for the widget.'),
});
export type SuggestWidgetDefaultsOutput = z.infer<typeof SuggestWidgetDefaultsOutputSchema>;

export async function suggestWidgetDefaults(input: SuggestWidgetDefaultsInput): Promise<SuggestWidgetDefaultsOutput> {
  return suggestWidgetDefaultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWidgetDefaultsPrompt',
  input: {schema: SuggestWidgetDefaultsInputSchema},
  output: {schema: SuggestWidgetDefaultsOutputSchema},
  prompt: `You are a digital signage expert. Given the type of widget, suggest reasonable initial property values.

Widget Type: {{widgetType}}

Respond with a JSON object containing the 'properties' field filled with relevant settings for this widget type.`,
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