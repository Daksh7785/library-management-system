import { IngestionService } from './ingestion';
import type { UniversalBookData } from './ingestion';
import { ARIAService } from './aria';

/**
 * PDF Intelligence Service
 * Handles metadata extraction and agentic analysis from academic PDFs.
 */
export class PDFIntelligenceService {
  
  /**
   * Processes a PDF file to extract metadata and perform ARIA analysis.
   */
  static async processPDF(file: File, libraryId: string, userTopic?: string): Promise<{ book: UniversalBookData | null, analysis: any }> {
    try {
      console.log(`📄 ARIA is triaging PDF: ${file.name}`);
      
      // 1. Simulate/Extract text (In production, use pdfjs-dist)
      const text = await this.mockExtractText(file);
      
      // 2. Perform Agentic Analysis via ARIA
      const analysis = await ARIAService.analyzePDF(text, userTopic);
      
      // 3. Trigger universal ingestion based on extracted titles/ISBNs
      const cleanTitle = analysis?.book_metadata?.title || file.name.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ');
      const book = await IngestionService.searchAndAdd(cleanTitle, libraryId);
      
      return { book, analysis };
    } catch (error) {
      console.error('PDF Processing Error:', error);
      return { book: null, analysis: null };
    }
  }

  /**
   * Mock text extraction for the demo environment
   */
  private static async mockExtractText(file: File): Promise<string> {
    // In a real environment, we would use pdfjs-dist to extract the first 10 pages.
    return `
      Title: The Future of ${file.name.replace('.pdf', '')}
      Abstract: This paper explores the intersection of academic intelligence and automated research pipelines...
      Keywords: AI, Agents, Research, Automation
      Conclusion: Our findings suggest that a 6-agent pipeline significantly outperforms single-prompt systems.
    `;
  }

  /**
   * Helper to find ISBN-13 in a block of text
   */
  static findISBN(text: string): string | null {
    const isbnRegex = /(97[89][ -]?[0-9][ -]?[0-9]{2}[ -]?[0-9]{6}[ -]?[0-9])/g;
    const match = text.match(isbnRegex);
    return match ? match[0].replace(/[ -]/g, '') : null;
  }
}
