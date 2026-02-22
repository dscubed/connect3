import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  rawText: string;
}

export default function Markdown({ rawText }: MarkdownProps) {
  return (<ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => (
        <h1 className="text-xl font-bold mt-3 mb-1">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-lg font-bold mt-2 mb-1">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>
      ),
      p: ({ children }) => (
        <p className="mb-2 last:mb-0">{children}</p>
      ),
      ul: ({ children }) => (
        <ul className="list-disc pl-5 mb-2 last:mb-0">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal pl-5 mb-2 last:mb-0">{children}</ol>
      ),
      li: ({ children }) => (
        <li className="my-0.5">{children}</li>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
      ),
      a: ({ children, href, ...props }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
          {...props}
        >
          {children}
        </a>
      ),
    }}
  >
    {rawText}
  </ReactMarkdown>);
}