// write a Cloudflare page function to only origins in the allowedOrigins array to access the

// A list of allowed origins that can access our backend API
const allowedOrigins = ['https://pizza-58c.pages.dev', 'http://localhost:9000'];

// A function that returns a set of CORS headers
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Origin': origin,
});

// Check the origin for this request
// If it is included in our set of known and allowed origins, return it, otherwise
// return a known, good origin. This effectively does not allow browsers to
// continue requests if the origin they're requesting from doesn't match.
const checkOrigin = (request) => {
  const origin = request.headers.get('Origin');
  const foundOrigin = allowedOrigins.find((allowedOrigin) =>
    allowedOrigin.includes(origin)
  );
  return foundOrigin ? foundOrigin : allowedOrigins[0];
};

const apikey = `${APIKEY}`;
const targetURL = `${URL}`;

export default {
  async fetch(request, env) {
    const NewResponse = await handleRequest(request);
    return NewResponse;
  },
};

async function handleRequest(request) {
  // Check that the request's origin is a valid origin, allowed to access this API
  const allowedOrigin = checkOrigin(request);
  if (request.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders(allowedOrigin) });
  }
  if (request.method === 'POST' && allowedOrigins.includes(allowedOrigin)) {
    const url = new URL(request.url);
    const headers_Origin =
      request.headers.get('Access-Control-Allow-Origin') || '*';
    url.host = targetURL.replace(/^https?:\/\//, '');
    request.headers.set('Authorization', apikey);
    let modifiedRequest = {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: 'follow',
    };

    const response = await fetch(url.toString(), modifiedRequest);
    const modifiedResponse = new Response(response.body, response);
    // 添加允许跨域访问的响应头 allow cors
    modifiedResponse.headers.set('Access-Control-Allow-Origin', headers_Origin);
    return modifiedResponse;
  }
  return new Response.redirect('https://pizza-58c.pages.dev');
}
