import { ParseResult } from "./types";

// Define proper types for PDF.js
interface PDFTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

interface PDFTextStyles {
  [key: string]: {
    fontFamily: string;
    ascent: number;
    descent: number;
    vertical: boolean;
  };
}

interface PDFTextContent {
  items: PDFTextItem[];
  styles: PDFTextStyles;
}

// Link annotations from getAnnotations() (external links have a url property)
interface PDFLinkAnnotation {
  url?: string;
  [key: string]: unknown;
}

interface PDFPageProxy {
  getTextContent(): Promise<PDFTextContent>;
  getAnnotations?(): Promise<PDFLinkAnnotation[]>;
}

interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

interface PDFJSLib {
  getDocument(src: ArrayBuffer): {
    promise: Promise<PDFDocumentProxy>;
  };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
}

declare global {
  interface Window {
    pdfjsLib: PDFJSLib;
  }
}

// Load PDF.js from CDN
if (typeof window !== "undefined" && !window.pdfjsLib) {
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  script.async = true;
  script.onload = () => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  };
  document.head.appendChild(script);
}

export async function parsePDF(file: File): Promise<ParseResult> {
  if (typeof window === "undefined") {
    return {
      success: false,
      error: "PDF parsing is only available in the browser",
    };
  }

  try {
    // Wait for pdfjsLib to be available
    if (!window.pdfjsLib) {
      await new Promise<void>((resolve) => {
        const checkPdfjs = () => {
          if (window.pdfjsLib) {
            resolve();
          } else {
            setTimeout(checkPdfjs, 100);
          }
        };
        checkPdfjs();
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;

    let fullText = "";
    const embeddedUrls = new Set<string>();

    // Extract text and embedded link URLs from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";

      // Extract URLs from link annotations (hyperlinks) when available
      if (typeof page.getAnnotations === "function") {
        try {
          const annotations = await page.getAnnotations();
          for (const ann of annotations ?? []) {
            const url = ann?.url?.trim();
            if (url && (url.startsWith("http") || url.includes(".com") || url.includes(".io") || url.includes(".org"))) {
              embeddedUrls.add(url);
            }
          }
        } catch {
          // getAnnotations can fail on some PDFs; ignore and keep text-only
        }
      }
    }

    // Append embedded link URLs so the resume extractor can use them
    if (embeddedUrls.size > 0) {
      fullText += "\n[Hyperlinks from document]:\n" + [...embeddedUrls].join("\n");
    }

    const cleanText = fullText.trim();

    if (cleanText.length < 10) {
      console.warn("PDF appears to be empty or contains no readable text");
      return {
        success: false,
        error: "PDF appears to be empty or contains no readable text",
      };
    }
    return { success: true, text: cleanText };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to parse PDF. The file may be corrupted or password-protected.",
    };
  }
}
