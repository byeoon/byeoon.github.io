const ipCooldownMap = new Map();

function isIpOnCooldown(ip) {
  const now = Date.now();
  const lastVisit = ipCooldownMap.get(ip);
  return lastVisit && (now - lastVisit < 3600000);
}

function setIpCooldown(ip) {
  ipCooldownMap.set(ip, Date.now());
  if (ipCooldownMap.size > 2000) {
    const now = Date.now();
    for (const [k, v] of ipCooldownMap.entries()) {
      if (now - v >= 3600000) ipCooldownMap.delete(k);
    }
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const isBot = !userAgent ||
      /curl|python|node-fetch|axios|go-http-client|postman|wget|httpx|insomnia|libwww|scrapy|bot|crawler|spider/i.test(userAgent);

    const cookieHeader = request.headers.get("cookie") || "";
    const hasVisitedCookie = cookieHeader.includes("visited=1");
    const hasVisitedIp = isIpOnCooldown(ip);

    let count = await env.COUNTER.get("visits");
    count = count ? parseInt(count, 10) : 0;

    const shouldIncrement = !isBot && !hasVisitedCookie && !hasVisitedIp;

    if (shouldIncrement) {
      count++;
      setIpCooldown(ip);
      await env.COUNTER.put("visits", count.toString());
    }

    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });

    let responsePayload = { count };

    if (shouldIncrement) {
      headers.append("Set-Cookie", "visited=1; Max-Age=86400; Path=/; SameSite=Strict; Secure");
    } else if (isBot) {
      responsePayload.message = "no u dont get to spam my counter";
    } else {
      responsePayload.message = "no u dont get to spam my counter";
    }

    return new Response(JSON.stringify(responsePayload), { headers });
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
