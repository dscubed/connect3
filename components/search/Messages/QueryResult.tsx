import type { ResultSection } from "@/lib/search/type";
import MatchResults from "../MatchResult/MatchResults";

export function ResultSection({ result }: { result: Partial<ResultSection> }) {
  return (
    <div className="space-y-4">
      {result.header && (
        <h3 className="text-lg font-semibold">{result.header}</h3>
      )}
      {result.text && (
        <p className="leading-relaxed opacity-80">{result.text}</p>
      )}
      {result.matches &&
        result.matches.map((match, index) => (
          <MatchResults key={index} match={match} userIndex={index} />
        ))}
    </div>
  );
}
