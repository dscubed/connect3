import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Auto-resize on value change
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto"; // Reset height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
      }
    }, [value, textareaRef]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      onChange?.(e);
    };

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className={cn(
          "w-full bg-transparent outline-none resize-none overflow-y-auto",
          className
        )}
        rows={1}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";
