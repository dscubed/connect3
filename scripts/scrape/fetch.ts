import axios from "axios";

export async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get(url, {
    timeout: 20000,
    headers: {
      "User-Agent": "Connect3KBCollector/1.0 (contact: you@example.com)",
      "Accept": "text/html,application/xhtml+xml",
    },
  });
  return res.data;
}
