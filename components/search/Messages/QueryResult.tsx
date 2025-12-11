import type { QueryResult } from "@/lib/search/type";
import MatchResults from "../MatchResult/MatchResults";

export function QueryResult({ result }: { result: Partial<QueryResult> }) {
  return (
    <div className="space-y-4">
      {result.header && (
        <h3 className="text-white/90 text-lg font-semibold">{result.header}</h3>
      )}
      {result.text && (
        <p className="text-white/80 leading-relaxed">{result.text}</p>
      )}
      {result.matches &&
        result.matches.map((match, index) => (
          <MatchResults key={index} match={match} userIndex={index} />
        ))}
    </div>
  );
}
