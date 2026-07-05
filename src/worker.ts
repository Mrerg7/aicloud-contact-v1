interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = 'aicloud.contact';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const redirectUrl = getCanonicalRedirect(request);
    if (redirectUrl) {
      return Response.redirect(redirectUrl, 301);
    }

    return env.ASSETS.fetch(request);
  },
};

function getCanonicalRedirect(request: Request): string | null {
  const url = new URL(request.url);

  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    return normalizeCanonicalUrl(url, request.url);
  }

  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    return normalizeCanonicalUrl(url, request.url);
  }

  return normalizeCanonicalUrl(url, request.url);
}

function normalizeCanonicalUrl(url: URL, originalUrl: string): string | null {
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
  if (hasFileExtension) {
    return url.toString() === originalUrl ? null : url.toString();
  }

  const hostIndex = originalUrl.indexOf(url.host);
  const afterHost = hostIndex === -1 ? '' : originalUrl.slice(hostIndex + url.host.length);

  if (!afterHost.startsWith('/')) {
    return `${CANONICAL_ORIGIN}/${afterHost}`;
  }

  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
    return url.toString();
  }

  if (url.origin !== CANONICAL_ORIGIN) {
    return `${CANONICAL_ORIGIN}${url.pathname}${url.search}`;
  }

  return null;
}
