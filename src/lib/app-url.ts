const CANONICAL_PRODUCTION_URL = "https://apolo-fit.vercel.app"

function normalizeUrl(url: string) {
  const withProtocol = url.startsWith("http") ? url : `https://${url}`
  return withProtocol.replace(/\/+$/, "")
}

export function getAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (
    configuredUrl &&
    (process.env.NODE_ENV !== "production" ||
      !configuredUrl.includes("localhost"))
  ) {
    return normalizeUrl(configuredUrl)
  }

  const vercelProductionUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()

  if (vercelProductionUrl) {
    return normalizeUrl(vercelProductionUrl)
  }

  return CANONICAL_PRODUCTION_URL
}
