import robotsParser from "robots-parser";
import axios from "axios";

export async function loadRobots(baseUrl: string) {
  const robotsUrl = new URL("/robots.txt", baseUrl).toString();
  try {
    const res = await axios.get(robotsUrl, { timeout: 15000 });
    return robotsParser(robotsUrl, res.data);
  } catch {
    // If no robots.txt, treat as unknown: you can choose to block or allow.
    // Safer default: allow but still rate-limit and use allowPrefixes.
    return robotsParser(robotsUrl, "");
  }
}
