export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/counter") {
      let count = await env.COUNTER.get("visits");
      count = count ? parseInt(count) : 0;
      count++;
      await env.COUNTER.put("visits", count.toString());

      return new Response(JSON.stringify({ count }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};