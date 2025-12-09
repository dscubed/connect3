import { SearchProgress } from "../types";

export function SearchProgressIndicator({
  progress,
}: {
  progress: SearchProgress | undefined;
}) {
  if (!progress) {
    return <div className="flex flex-col space-y-4">Starting Search...</div>;
  }

  // Find the current step index
  const currentActionIndex = progress.actions.findIndex(
    (a) => !a.refining && !a.reasoning
  );

  return (
    <div className="flex flex-col space-y-4">
      {progress.context &&
        (progress.context === "start" ? (
          <div className="animate-pulse text-white/70">
            Analyzing Context...
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="text-white/70">Context Analyzed:</div>
            <div className="text-white/90 italic">{progress.context}</div>
          </div>
        ))}
      {progress.actions.map((action, index) => {
        // Determine if this is the current step
        const isCurrent =
          index === currentActionIndex ||
          (currentActionIndex === -1 && index === progress.actions.length - 1);

        // Classes for faded vs. active
        const faded = "text-white/30";
        const active = "text-white/90";
        const pulse = "animate-pulse text-white/70";

        return (
          <div key={index}>
            {action.searching && (
              <div className={`flex flex-col ${isCurrent ? active : faded}`}>
                <div>Searching...</div>
                {action.searching.map((query, qIndex) => (
                  <div key={qIndex} className={isCurrent ? pulse : ""}>
                    {query}
                  </div>
                ))}
              </div>
            )}
            {action.refining &&
              (action.refining === "start" ? (
                <div className={isCurrent ? pulse : faded}>
                  Refining Results...
                </div>
              ) : (
                <div className={`italic ${isCurrent ? active : faded}`}>
                  {action.refining}
                </div>
              ))}
            {action.reasoning &&
              (action.reasoning === "start" ? (
                <div className={isCurrent ? pulse : faded}>
                  Reasoning Next Steps...
                </div>
              ) : (
                <div className={`italic ${isCurrent ? active : faded}`}>
                  {action.reasoning}
                </div>
              ))}
          </div>
        );
      })}
      {progress.generating && (
        <div className="animate-pulse text-white/70">
          Generating Response...
        </div>
      )}
    </div>
  );
}
