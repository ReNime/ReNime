export async function GET(req, { params }) {
  const { slug } = params;

  try {
    const url = `https://www.sankavollerei.com/anime/animasu/detail/${slug}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": req.headers.get("user-agent") || 
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://www.sankavollerei.com/",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: true, message: "Gagal fetch API sumber" }),
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);

  } catch (err) {
    return Response.json({
      error: true,
      message: "Gagal proxy API",
      detail: err.message,
    });
  }
}
