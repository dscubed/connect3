import axios from "axios";

export async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get(url, {
    timeout: 30000,
    responseType: "stream",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Accept": "text/html",
      "Accept-Language": "en-AU,en;q=0.9",
      "Referer": "https://monashstudentassociation.com.au/",
    },
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    throw new Error(`HTTP ${res.status}`);
  }

  return await new Promise<string>((resolve, reject) => {
    let data = "";
    res.data.on("data", (chunk: Buffer) => {
      data += chunk.toString("utf8");
      // optional safety cap (prevents infinite streams)
      if (data.length > 5_000_000) resolve(data);
    });
    res.data.on("end", () => resolve(data));
    res.data.on("error", reject);
  });
}