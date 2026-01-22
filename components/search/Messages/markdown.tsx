import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-li:my-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeExternalLinks,
            { target: "_blank", rel: ["noopener", "noreferrer"] },
          ],
        ]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-2 mb-1">{children}</h3>
          ),
          a: ({ children, ...props }) => (
            <a
              {...props}
              target={props.target ?? "_blank"}
              rel={props.rel ?? "noopener noreferrer"}
              className="underline underline-offset-4 font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
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
