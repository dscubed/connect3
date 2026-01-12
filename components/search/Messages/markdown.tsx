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
