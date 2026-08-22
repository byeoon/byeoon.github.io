export async function onRequest(context) {
  const { env } = context;
  try {
    let count = await env.COUNTER.get("visits");
    count = count ? parseInt(count, 10) : 0;
    count++;
    await env.COUNTER.put("visits", count.toString());

    return new Response(JSON.stringify({ count }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
