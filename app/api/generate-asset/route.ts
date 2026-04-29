import {
  buildEnhancedPrompt,
  buildProviderRequest,
  readProviderError,
  sanitizeGenerationInput
} from "../../../lib/ai";
import { saveGeneration } from "../../../lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = sanitizeGenerationInput(body);
    const enhancedPrompt = buildEnhancedPrompt(input);
    const savedResult = await saveGeneration({
      ...input,
      enhancedPrompt,
      provider: "pollinations",
      createdAt: new Date()
    });
    const providerRequest = buildProviderRequest(input, enhancedPrompt);
    const providerResponse = await fetch(providerRequest.url, providerRequest.init);

    if (!providerResponse.ok || !providerResponse.body) {
      const errorMessage = await readProviderError(providerResponse);

      return Response.json(
        {
          success: false,
          error: errorMessage,
          saved: savedResult.saved
        },
        { status: providerResponse.status || 500 }
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      providerResponse.headers.get("content-type") ||
        (input.mode === "video" ? "video/mp4" : "image/jpeg")
    );
    headers.set("Cache-Control", "no-store");
    headers.set(
      "x-humanverse-storage",
      savedResult.saved ? "mongodb" : "local"
    );

    if (savedResult.reason) {
      headers.set(
        "x-humanverse-storage-reason",
        encodeURIComponent(savedResult.reason)
      );
    }

    return new Response(providerResponse.body, {
      headers,
      status: 200
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected server error."
      },
      { status: 500 }
    );
  }
}
