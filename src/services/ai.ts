import { fetchBooks } from './api';
import type { Book } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  books?: Book[]; // Optional list of books mentioned/recommended
  reasoning?: string[]; // Optional reasoning for each book
}

const GREETINGS = [
  "Hello! I'm your AI Library Concierge. Tell me your mood, what you want to feel, or simply what you're looking for!",
  "Hi there! Need a book recommendation? Tell me what kind of journey you want to embark on today.",
];

export const processChatMessage = async (
  message: string,
  _history: ChatMessage[]
): Promise<ChatMessage> => {
  const books = await fetchBooks();
  const lowerMessage = message.toLowerCase();

  let responseContent = "";
  let matchedBooks: Book[] = [];
  let reasoning: string[] = [];

  // 1. Mood/Feeling Concierge Logic
  const isMoodQuery = lowerMessage.includes('feel') || lowerMessage.includes('mood') || lowerMessage.includes('want to') || lowerMessage.includes('cry') || lowerMessage.includes('hope') || lowerMessage.includes('laugh');
  
  if (isMoodQuery) {
    if (lowerMessage.includes('cry') || lowerMessage.includes('sad')) {
      matchedBooks = books.filter(b => b.category === 'Fiction').slice(0, 3);
      responseContent = "I hear you. Sometimes a good cry is exactly what we need. Here are some emotionally resonant books that explore deep human connections:";
      reasoning = matchedBooks.map(b => `This ${b.category} book is known to evoke strong emotions and explores complex characters, perfect for when you want to feel deeply.`);
    } else if (lowerMessage.includes('hope') || lowerMessage.includes('inspire') || lowerMessage.includes('motivation')) {
      matchedBooks = books.filter(b => b.category === 'Self-Help' || b.category === 'Biography').slice(0, 3);
      responseContent = "Looking for a spark of hope? These books are known for their uplifting narratives and empowering messages:";
      reasoning = matchedBooks.map(b => `A highly rated ${b.category} read that has inspired many readers to overcome challenges and find new perspectives.`);
    } else if (lowerMessage.includes('laugh') || lowerMessage.includes('funny')) {
      matchedBooks = books.filter(b => b.rating > 4.5).slice(0, 3); // Fallback to highly rated
      responseContent = "Ready for some joy? While I don't have a dedicated comedy section, these highly-rated favorites often bring a smile:";
      reasoning = matchedBooks.map(b => `Rated ${b.rating} stars, this beloved book has a lighthearted touch that readers consistently enjoy.`);
    } else {
      // General mood
      matchedBooks = books.sort(() => 0.5 - Math.random()).slice(0, 3);
      responseContent = "Based on that vibe, I've curated a unique selection just for you. Here is what I recommend:";
      reasoning = matchedBooks.map(b => `I selected this ${b.category} book because its atmospheric storytelling aligns perfectly with your current mood.`);
    }
  } 
  // 2. Standard Search
  else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    matchedBooks = books.sort((a, b) => b.rating - a.rating).slice(0, 3);
    responseContent = "I highly recommend our top-rated books right now:";
    reasoning = matchedBooks.map(b => `With a stellar rating of ${b.rating}/5, this is one of our most universally praised titles.`);
  } else if (lowerMessage.includes('show') || lowerMessage.includes('find') || lowerMessage.includes('search')) {
    const term = lowerMessage.replace(/(show|find|search|me|books|about)/g, '').trim();
    matchedBooks = books.filter(b => 
      b.title.toLowerCase().includes(term) || 
      b.category.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term)
    ).slice(0, 3);
    
    if (matchedBooks.length > 0) {
      responseContent = `I found ${matchedBooks.length} book(s) matching your request:`;
      reasoning = matchedBooks.map(b => `Matches your search criteria under the ${b.category} section.`);
    } else {
      responseContent = "I couldn't find any specific books matching that query. Try describing your mood or asking for a general recommendation!";
    }
  } else if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    responseContent = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  } else {
    responseContent = "I'm your AI Concierge. You can ask me to find a specific book, or just describe how you want to feel after reading (e.g., 'I want something that makes me hopeful').";
  }

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: responseContent,
    timestamp: new Date().toISOString(),
    books: matchedBooks.length > 0 ? matchedBooks : undefined,
    reasoning: reasoning.length > 0 ? reasoning : undefined
  };
};
