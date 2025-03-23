export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    // 当 pathname 为 "/" 时，key 为 "/"，否则去掉前导斜杠后的部分作为 key
    const key = pathname

    if (key === '/')
    {
      return new Response(JSON.stringify({ error: "Not Allowed" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
    }

    if (request.method === "GET") {
      // 从 KV 中获取数据
      const value = await env.MY_KV.get(key);
      if (value !== null) {
        return new Response(JSON.stringify({ data: value }), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ error: "Not Found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (request.method === "POST") {
      // 检查请求体是否为 JSON 格式
      let jsonData;
      try {
        jsonData = await request.json();
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "Request body must be valid JSON" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      // 检查是否包含 data 字段
      if (!("data" in jsonData)) {
        return new Response(
          JSON.stringify({ error: "Missing 'data' in JSON body" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const data = jsonData.data;

      try {
        // 写入或更新 KV 中的键值
        await env.MY_KV.put(key, data);
        return new Response(JSON.stringify({ data }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(
          JSON.stringify({ error: e.toString() }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
