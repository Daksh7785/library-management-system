import { supabase } from '../lib/supabase';
import { ARIA_IDENTITY, RESEARCH_PLANNER_PROMPT, PDF_INTELLIGENCE_PROMPT, CAREER_DNA_PROMPT } from './prompts';

export interface ARIAResponse {
  topic: string;
  executive_summary: string;
  knowledge_map: any;
  priority_subtopics: any[];
  resource_library: any;
  four_week_plan: any;
  innovation_opportunities: any[];
  confidence_score: string;
  next_prompt_suggestion: string;
}

export class ARIAService {
  
  /**
   * Orchestrates the 6-agent Research Planner pipeline
   */
  static async planResearch(topic: string): Promise<ARIAResponse | null> {
    try {
      console.log(`🧠 ARIA is orchestrating research for: ${topic}`);
      
      // In a production environment, this calls a Supabase Edge Function 
      // that interacts with an LLM (GPT-4 or Claude 3.5)
      const { data, error } = await supabase.functions.invoke('aria-research-planner', {
        body: { 
          topic,
          systemPrompt: ARIA_IDENTITY,
          masterPrompt: RESEARCH_PLANNER_PROMPT
        }
      });

      if (error) {
        console.warn('ARIA Edge Function error, falling back to mock intelligence...');
        return this.generateMockResearch(topic);
      }

      return data;
    } catch (e) {
      console.error('ARIA Service Error:', e);
      return this.generateMockResearch(topic);
    }
  }

  /**
   * Processes PDF content using the Research Analyst agent
   */
  static async analyzePDF(text: string, userTopic?: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('aria-pdf-intel', {
        body: { 
          text,
          userTopic,
          systemPrompt: ARIA_IDENTITY,
          masterPrompt: PDF_INTELLIGENCE_PROMPT
        }
      });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('PDF Analysis Error:', e);
      return null;
    }
  }

  /**
   * Career DNA Analysis for Internships
   */
  static async analyzeCareer(resume: string, jobDescription: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('aria-career-dna', {
        body: { 
          resume,
          jobDescription,
          systemPrompt: ARIA_IDENTITY,
          masterPrompt: CAREER_DNA_PROMPT
        }
      });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Career Analysis Error:', e);
      return null;
    }
  }

  /**
   * Fallback mock intelligence for demo purposes
   */
  private static generateMockResearch(topic: string): ARIAResponse {
    return {
      topic,
      executive_summary: `Research into ${topic} reveals a rapidly evolving landscape with significant innovation in the cross-section of automation and human-centric design.`,
      knowledge_map: {
        nodes: [
          { id: '1', label: 'Foundations' },
          { id: '2', label: 'Advanced Theory' },
          { id: '3', label: 'Practical Application' }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '2', to: '3' }
        ]
      },
      priority_subtopics: [
        { name: 'Core Principles', impact: 9, difficulty: 4, time: 12, pre: 'None' },
        { name: 'Advanced Architectures', impact: 10, difficulty: 8, time: 25, pre: 'Core Principles' }
      ],
      resource_library: {
        academic: 'The Future of ' + topic + ' (IEEE Journal, 2024)',
        book: 'Mastering ' + topic + ' by Dr. Aris Thorne',
        online: 'Coursera: ' + topic + ' Specialization'
      },
      four_week_plan: {
        week1: 'Foundation Building & Theory',
        week2: 'Core Architecture Mastery',
        week3: 'Advanced Case Studies',
        week4: 'Final Project Implementation'
      },
      innovation_opportunities: [
        'Integrating ' + topic + ' with decentralized networks',
        'Human-in-the-loop ' + topic + ' optimization'
      ],
      confidence_score: '85%',
      next_prompt_suggestion: 'Would you like to explore the innovation hooks for ' + topic + '?'
    };
  }
}
