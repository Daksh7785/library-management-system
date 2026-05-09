/**
 * AcademicOS — AI Librarian Service
 *
 * Real AI endpoint that:
 *  1. Searches the catalog for context
 *  2. Sends context + user query to OpenAI / Gemini
 *  3. Returns a grounded, helpful response
 *
 * Falls back to catalog-based responses if no AI key is configured.
 */

import { supabase } from '../lib/supabase';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AI_KEY = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
const USE_OPENAI = !!import.meta.env.VITE_OPENAI_API_KEY;

export const AILibrarianService = {
  /**
   * Send a message to the AI Librarian.
   */
  async chat(userMessage: string, history: ChatMessage[]): Promise<string> {
    // 1. Search catalog for relevant books
    const { data: relatedBooks } = await supabase
      .from('books')
      .select('title, author, category, description, subjects, published_year')
      .or(`title.ilike.%${userMessage.split(' ').slice(0, 3).join('%')}%,subjects.cs.{${userMessage.split(' ')[0]}}`)
      .limit(5);

    const catalogContext = (relatedBooks || [])
      .map((b) => `• "${b.title}" by ${b.author} (${b.published_year || 'N/A'}) — ${b.category || 'General'}`)
      .join('\n');

    // 2. If AI key is available, use LLM
    if (AI_KEY) {
      try {
        return await this._callLLM(userMessage, catalogContext, history);
      } catch (e) {
        console.warn('AI call failed, using fallback:', (e as Error).message);
      }
    }

    // 3. Fallback: smart catalog-based response
    return this._fallbackResponse(userMessage, relatedBooks || []);
  },

  /**
   * Call OpenAI or Gemini with catalog context.
   */
  async _callLLM(query: string, context: string, history: ChatMessage[]): Promise<string> {
    const systemPrompt = `You are the AcademicOS AI Librarian — a knowledgeable, friendly assistant for a global academic library.
You have access to a catalog of millions of books. Here are some relevant ones:

${context || 'No specific catalog matches found.'}

Guidelines:
- Be concise but helpful
- Reference specific books from the catalog when relevant
- Suggest books the user might enjoy
- Help with research questions
- Never make up book titles or ISBNs`;

    if (USE_OPENAI) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-6),
            { role: 'user', content: query },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const json = await res.json();
      return json.choices?.[0]?.message?.content || 'I could not generate a response.';
    }

    // Gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nUser: ${query}` },
              ],
            },
          ],
        }),
      }
    );

    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';
  },

  /**
   * Fallback when no AI key is configured.
   */
  _fallbackResponse(query: string, books: any[]): string {
    const q = query.toLowerCase();

    if (books.length > 0) {
      const bookList = books.slice(0, 3).map((b) => `"${b.title}" by ${b.author}`).join(', ');
      return `Based on your query, I found these in our catalog: ${bookList}. Would you like more details on any of these, or should I search for something more specific?`;
    }

    if (q.includes('recommend') || q.includes('suggest')) {
      return `I'd be happy to recommend books! Could you tell me what subject or genre you're interested in? For example: "machine learning", "philosophy", "fiction", etc.`;
    }

    if (q.includes('how') || q.includes('help')) {
      return `I can help you with:\n• **Finding books** — search by title, author, or topic\n• **Recommendations** — personalized suggestions based on your reading history\n• **Research** — help locate academic resources\n• **Managing your library** — track reading status, add reviews\n\nWhat would you like to do?`;
    }

    return `I searched our catalog but didn't find an exact match for "${query}". Try being more specific, or I can search by ISBN if you have one. I can also recommend popular books in any subject area.`;
  },
};
