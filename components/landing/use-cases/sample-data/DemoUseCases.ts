import { networkingQueries } from "./query-data/NetworkingQueries";
import { clubQueries } from "./query-data/ClubQueries";
import { eventQueries } from "./query-data/EventQueries";

export const demoUseCases = [
  {
    id: "networking",
    label: "Networking",
    queries: networkingQueries.queries,
  },
  {
    id: "clubs",
    label: "Clubs",
    queries: clubQueries.queries,
  },
  {
    id: "events",
    label: "Events",
    queries: eventQueries.queries,
  },
];
