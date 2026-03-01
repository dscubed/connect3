export function isAllowedRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);

    if (
      process.env.NODE_ENV === "development" &&
      parsed.hostname === "localhost"
    ) {
      return true;
    }

    return (
      parsed.protocol === "https:" && parsed.hostname.endsWith(".connect3.app")
    );
  } catch {
    return false;
  }
}
