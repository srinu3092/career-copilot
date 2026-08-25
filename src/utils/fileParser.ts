import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set PDF worker URL', e);
  }
}

/**
 * Extract clean readable text from various resume file formats:
 * PDF, DOCX, DOC, TXT, MD, RTF
 */
export async function extractTextFromFile(
  file: File,
  onProgress?: (status: string) => void
): Promise<{ text: string; pageCount?: number }> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  onProgress?.(`Reading ${file.name}...`);

  if (extension === 'pdf') {
    return extractTextFromPdf(file, onProgress);
  } else if (extension === 'docx') {
    return extractTextFromDocx(file, onProgress);
  } else {
    // Plain text, markdown, rtf, or unknown text-based files
    return extractTextFromPlainText(file, onProgress);
  }
}

async function extractTextFromPdf(
  file: File,
  onProgress?: (status: string) => void
): Promise<{ text: string; pageCount: number }> {
  onProgress?.('Extracting PDF text layers...');
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress?.(`Parsing PDF page ${pageNum} of ${numPages}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine items with appropriate spacing
      let lastY: number | null = null;
      let pageString = '';

      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          // If vertical jump is noticeable, add a newline
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageString += '\n';
          } else if (pageString.length > 0 && !pageString.endsWith(' ') && !pageString.endsWith('\n')) {
            pageString += ' ';
          }
          pageString += item.str;
          lastY = item.transform[5];
        }
      }

      pageTexts.push(pageString.trim());
    }

    const fullText = pageTexts.join('\n\n');
    if (!fullText.trim()) {
      throw new Error('No selectable text found in this PDF. It may be an image scan.');
    }

    return {
      text: cleanExtractedText(fullText),
      pageCount: numPages,
    };
  } catch (err: any) {
    console.error('PDF parsing error:', err);
    // Fallback: try raw ASCII extraction in case worker failed
    const fallbackText = extractAsciiFallback(arrayBuffer);
    if (fallbackText && fallbackText.length > 50) {
      return { text: fallbackText, pageCount: 1 };
    }
    throw new Error(err?.message || 'Failed to read PDF document. Please try copying & pasting the text.');
  }
}

async function extractTextFromDocx(
  file: File,
  onProgress?: (status: string) => void
): Promise<{ text: string; pageCount: number }> {
  onProgress?.('Extracting Word DOCX text...');
  const arrayBuffer = await file.arrayBuffer();

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = cleanExtractedText(result.value);
    if (!text.trim()) {
      throw new Error('DOCX document was empty or contains only images.');
    }
    return { text, pageCount: 1 };
  } catch (err: any) {
    console.error('DOCX parsing error:', err);
    throw new Error(err?.message || 'Failed to parse DOCX document.');
  }
}

async function extractTextFromPlainText(
  file: File,
  onProgress?: (status: string) => void
): Promise<{ text: string; pageCount: number }> {
  onProgress?.('Reading text file...');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      resolve({ text: cleanExtractedText(raw), pageCount: 1 });
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsText(file);
  });
}

function cleanExtractedText(raw: string): string {
  if (!raw) return '';
  return raw
    // Remove null bytes and unprintable ASCII control characters except \n and \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize unicode whitespace
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Replace multiple consecutive blank lines with at most 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractAsciiFallback(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  let inText = false;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // Printable ASCII + newline/tab
    if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
      result += String.fromCharCode(b);
      inText = true;
    } else {
      if (inText && result.slice(-1) !== ' ') {
        result += ' ';
      }
      inText = false;
    }
  }
  return result.replace(/\s+/g, ' ').slice(0, 5000);
}
