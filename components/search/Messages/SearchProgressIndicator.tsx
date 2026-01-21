import { CheckCircle2, Loader } from "lucide-react";
import { ProgressAction } from "../utils";
import { cn } from "@/lib/utils";

export function SearchProgressIndicator({
  progress,
}: {
  progress?: ProgressAction[];
}) {
  if (!progress || progress.length === 0 || progress == undefined) {
    return <div className="flex flex-col space-y-4">Starting Search...</div>;
  }
  console.log("[ProgressIndicator] rendering:", progress);

  return (
    <div className="flex flex-col space-y-4">
      {progress.map((action, index) => (
        <div key={index} className="relative flex flex-col animate-fade-in">
          {index < progress.length - 1 && (
            <span className="absolute left-2 top-6 h-full w-px bg-black z-0" />
          )}
          <div className="flex items-center space-x-2">
            {action.status === "complete" ? (
              <CheckCircle2 className="w-5 h-5 bg-white text-muted" />
            ) : (
              <Loader className="w-5 h-5 animate-spin bg-white" />
            )}
            <span
              className={cn(
                "font-medium",
                action.status === "complete" ? "text-muted" : "animate-pulse",
              )}
            >
              {action.message}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
