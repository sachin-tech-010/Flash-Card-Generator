import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { FlashCard } from '../models/flashcard.model';

export interface CardCountRange {
  min: number;
  max: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // IMPORTANT: This relies on `process.env.API_KEY` being set in the environment.
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.error('API_KEY environment variable not set.');
    }
  }

  async analyzeTextForCardCount(text: string): Promise<CardCountRange> {
    if (!this.ai) {
      throw new Error('Gemini AI client is not initialized. Check API Key.');
    }

    const prompt = `Analyze the following text and determine a reasonable minimum and maximum number of flash cards that can be generated from it. The minimum should be at least 4, and the maximum should not exceed 10. Focus on extracting distinct, important concepts.

Text:
---
${text}
---

Provide your answer as a JSON object with 'min' and 'max' keys.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              min: {
                type: Type.INTEGER,
                description: 'The minimum number of flash cards (at least 4).',
              },
              max: {
                type: Type.INTEGER,
                description: 'The maximum number of flash cards (at most 10).',
              },
            },
            required: ['min', 'max'],
          },
        },
      });

      const jsonString = response.text;
      const parsed = JSON.parse(jsonString);
      if (typeof parsed.min !== 'number' || typeof parsed.max !== 'number') {
        throw new Error('Invalid response format from AI.');
      }
      return parsed;

    } catch (error) {
      console.error('Error analyzing text for card count:', error);
      throw new Error('Failed to analyze text. Please try again.');
    }
  }


  async generateFlashCards(text: string, cardCount: number): Promise<FlashCard[]> {
    if (!this.ai) {
      throw new Error('Gemini AI client is not initialized. Check API Key.');
    }

    const prompt = `Based on the following text, generate exactly ${cardCount} flash cards. Each flash card should have a clear 'question' and a concise 'answer'. Extract the most important concepts, definitions, and key facts.

Text:
---
${text}
---

Generate the ${cardCount} flash cards now.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: {
                      type: Type.STRING,
                      description: 'The question or term for the front of the flashcard.',
                    },
                    answer: {
                      type: Type.STRING,
                      description: 'The answer or definition for the back of the flashcard.',
                    },
                  },
                  required: ['question', 'answer']
                },
              },
            },
            required: ['flashcards']
          },
        },
      });

      const jsonString = response.text;
      const parsed = JSON.parse(jsonString);
      return parsed.flashcards || [];

    } catch (error) {
      console.error('Error generating flash cards:', error);
      throw new Error('Failed to generate flash cards. Please try again.');
    }
  }
}
