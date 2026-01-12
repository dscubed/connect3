import { SearchProgress } from "../types";

export function SearchProgressIndicator({
  progress,
}: {
  progress: SearchProgress | undefined;
}) {
  if (!progress) {
    return <div className="flex flex-col space-y-4">Starting Search...</div>;
  }

  // Helper function for converting 2 dates to a duration string
  const formatDuration = (start: Date, end: Date) => {
    const endDate = new Date(end);
    const startDate = new Date(start);
    const durationMs = endDate.getTime() - startDate.getTime();
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor(durationMs / (1000 * 60));
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col space-y-4">
      {progress.message && (
        <div className="animate-pulse text-white/70">{progress.message}</div>
      )}
      {/* Context */}
      {progress.context &&
        (!progress.context.end ? (
          <div className="animate-pulse text-white/70">
            Analyzing Context...
          </div>
        ) : (
          <>
            <div className="text-white/30">
              {`Thought for: ${formatDuration(
                progress.context.start,
                progress.context.end
              )}`}
            </div>
            <div className="text-white/30">{progress.context.data}</div>
          </>
        ))}

      {progress.iterations?.map((iteration, index) => {
        // Determine if this is the current step
        const isCurrent = index === progress.iterations!.length - 1;

        // Classes for faded vs. active
        const faded = "text-white/30";
        const active = "text-white/90";
        const pulse = "animate-pulse text-white/70";

        return (
          <div key={index}>
            {/* Searching */}
            {iteration.searching && Array.isArray(iteration.searching.data) && (
              <div className={`flex flex-col ${isCurrent ? active : faded}`}>
                <div>Searching...</div>
                {iteration.searching.data.map(
                  (query: string, qIndex: number) => (
                    <div key={qIndex} className={isCurrent ? pulse : ""}>
                      {query}
                    </div>
                  )
                )}
                {iteration.searching.end ? (
                  <div className={`italic ${isCurrent ? active : faded}`}>
                    Search Finished
                  </div>
                ) : null}
              </div>
            )}

            {/* Refining */}
            {iteration.refining &&
              (!iteration.refining.end ? (
                <div className={isCurrent ? pulse : faded}>
                  Refining Results...
                </div>
              ) : (
                <div className={`italic ${isCurrent ? active : faded}`}>
                  Refining returned {iteration.refining.data} results
                </div>
              ))}
            {iteration.reasoning &&
              (!iteration.reasoning.end ? (
                <div className={isCurrent ? pulse : faded}>
                  Reasoning Next Steps...
                </div>
              ) : (
                <div className={`italic ${isCurrent ? active : faded}`}>
                  {iteration.reasoning.data}
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
