import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    // Translate client-side localhost URL to internal Docker service name if needed
    let resolvedUrl = targetUrl;
    if (resolvedUrl.includes("localhost:8000")) {
      resolvedUrl = resolvedUrl.replace("http://localhost:8000", "http://app");
    } else if (resolvedUrl.includes("127.0.0.1:8000")) {
      resolvedUrl = resolvedUrl.replace("http://127.0.0.1:8000", "http://app");
    }

    const response = await fetch(resolvedUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch animation: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Lottie Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching Lottie animation", details: errorMessage },
      { status: 500 }
    );
  }
}
