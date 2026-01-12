import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-li:my-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeExternalLinks, { target: "_blank", rel: ["noreferrer", "noopener"] }],
        ]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              className="underline underline-offset-4 font-medium decoration-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
            >
              {children}
              <span className="ml-1" aria-hidden>
                ↗
              </span>
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
