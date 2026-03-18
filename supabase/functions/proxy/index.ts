const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing ?url= parameter', { status: 400, headers: corsHeaders });
    }

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return new Response('Invalid URL', { status: 400, headers: corsHeaders });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return new Response('Only HTTP(S) URLs allowed', { status: 400, headers: corsHeaders });
    }

    console.log('Proxying:', targetUrl);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    
    // For HTML content, rewrite relative URLs to absolute
    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      const baseUrl = `${parsed.protocol}//${parsed.host}`;
      
      // Inject a <base> tag so relative URLs resolve correctly
      html = html.replace(
        /(<head[^>]*>)/i,
        `$1<base href="${baseUrl}/">`
      );

      // If no <head>, add before first tag
      if (!/<head/i.test(html)) {
        html = `<base href="${baseUrl}/">\n` + html;
      }

      return new Response(html, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          // Remove iframe-blocking headers
        },
      });
    }

    // For non-HTML (CSS, JS, images), pass through
    const body = await response.arrayBuffer();
    return new Response(body, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    const msg = error instanceof Error ? error.message : 'Proxy failed';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
