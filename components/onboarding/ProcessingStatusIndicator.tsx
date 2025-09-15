import { Loader2 } from "lucide-react";
import React from "react";

interface ProcessingStatusIndicatorProps {
  state: string;
  currentFile?: string;
}

export const ProcessingStatusIndicator: React.FC<
  ProcessingStatusIndicatorProps
> = ({ state, currentFile }) => {
  if (state === "idle") return null;

  let statusText = "";
  switch (state) {
    case "parsing":
      statusText = `Processing ${currentFile}`;
      break;
    case "validating":
      statusText = `Validating ${currentFile} content`;
      break;
    case "summarizing":
      statusText = "Generating profile summary";
      break;
    case "uploading":
      statusText = "Uploading your profile";
      break;
    case "success":
      statusText = "Processing complete";
      break;
    case "chunking":
      statusText = "Chunking content for upload";
      break;
    case "error":
      statusText = "Processing failed";
      break;
    default:
      statusText = "";
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-background border rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin h-4 w-4" />
        <span>{statusText}</span>
      </div>
    </div>
  );
};
