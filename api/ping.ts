/** Minimal runtime smoke test; works even when Firebase is unconfigured. */
export default {
  fetch(request: Request) {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Method not allowed' }, {
        status: 405,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    return Response.json(
      { service: 'dr-samik-api', status: 'ok' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  },
};
