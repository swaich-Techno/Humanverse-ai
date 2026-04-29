import {
  buildEnhancedPrompt,
  buildVideoProviderRequest,
  getImageModel,
  getImageQuality,
  getImageSize,
  getPollinationsApiKey,
  readProviderError,
  sanitizeGenerationInput
} from "../../../lib/ai";
import { saveGeneration } from "../../../lib/mongodb";

export const runtime = "nodejs";

type PollinationsImagePayload = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = sanitizeGenerationInput(body);
    const apiKey = getPollinationsApiKey();

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error:
            "Missing POLLINATIONS_API_KEY. In Vercel, open your project, go to Settings > Environment Variables, add POLLINATIONS_API_KEY, then redeploy."
        },
        { status: 500 }
      );
    }

    const enhancedPrompt = buildEnhancedPrompt(input);
    const savedResult = await saveGeneration({
      ...input,
      enhancedPrompt,
      provider: "pollinations",
      createdAt: new Date()
    });

    if (input.mode === "image") {
      const providerResponse = await fetch(
        "https://gen.pollinations.ai/v1/images/generations",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            model: getImageModel(input),
            quality: getImageQuality(input),
            size: getImageSize(input.aspectRatio),
            response_format: "b64_json"
          })
        }
      );

      if (!providerResponse.ok) {
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

      const payload = (await providerResponse.json()) as PollinationsImagePayload;
      const imageData = payload.data?.[0];

      if (imageData?.b64_json) {
        const bytes = Buffer.from(imageData.b64_json, "base64");
        const headers = buildSuccessHeaders(savedResult);
        headers.set("Content-Type", "image/png");

        return new Response(bytes, {
          headers,
          status: 200
        });
      }

      if (imageData?.url) {
        const imageResponse = await fetch(imageData.url, {
          cache: "no-store"
        });

        if (!imageResponse.ok || !imageResponse.body) {
          const errorMessage = await readProviderError(imageResponse);

          return Response.json(
            {
              success: false,
              error: errorMessage,
              saved: savedResult.saved
            },
            { status: imageResponse.status || 500 }
          );
        }

        return new Response(imageResponse.body, {
          headers: buildSuccessHeaders(
            savedResult,
            imageResponse.headers.get("content-type") || "image/png"
          ),
          status: 200
        });
      }

      return Response.json(
        {
          success: false,
          error: "The image provider did not return usable image data.",
          saved: savedResult.saved
        },
        { status: 500 }
      );
    }

    const providerRequest = buildVideoProviderRequest(input, enhancedPrompt);
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

    return new Response(providerResponse.body, {
      headers: buildSuccessHeaders(
        savedResult,
        providerResponse.headers.get("content-type") || "video/mp4"
      ),
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

function buildSuccessHeaders(
  savedResult: { saved: boolean; reason?: string },
  contentType = "image/jpeg"
) {
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "no-store");
  headers.set("x-humanverse-storage", savedResult.saved ? "mongodb" : "local");

  if (savedResult.reason) {
    headers.set(
      "x-humanverse-storage-reason",
      encodeURIComponent(savedResult.reason)
    );
  }

  return headers;
}
