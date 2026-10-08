export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { baseUrl, apiKey, ...payload } = body;

        if (!baseUrl || !apiKey || !payload.model) {
            return new Response(JSON.stringify({ error: 'Missing required fields: baseUrl, apiKey, or model' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const endpoint = baseUrl.replace(/\/+$/, '') + '/chat/completions';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return new Response(
                JSON.stringify({ error: errorData || { message: `HTTP ${response.status}: ${response.statusText}` } }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Custom Router Proxy Error:', error);
        return new Response(
            JSON.stringify({ error: { message: error.message || 'Internal Server Error' } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
