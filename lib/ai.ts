export type GenerationMode = "image" | "video";
export type GenerationSubject = "character" | "place" | "scene" | "product";
export type GenerationStyle = "cinematic" | "editorial" | "travel" | "luxury";
export type AspectRatio = "1:1" | "3:4" | "16:9" | "9:16";

export type GenerationInput = {
  prompt: string;
  mode: GenerationMode;
  subject: GenerationSubject;
  style: GenerationStyle;
  aspectRatio: AspectRatio;
  duration?: number;
  motionHint?: string;
  addSoundtrack?: boolean;
};

const validModes = new Set<GenerationMode>(["image", "video"]);
const validSubjects = new Set<GenerationSubject>([
  "character",
  "place",
  "scene",
  "product"
]);
const validStyles = new Set<GenerationStyle>([
  "cinematic",
  "editorial",
  "travel",
  "luxury"
]);
const validAspectRatios = new Set<AspectRatio>([
  "1:1",
  "3:4",
  "16:9",
  "9:16"
]);

const subjectDescriptors: Record<GenerationSubject, string> = {
  character:
    "real-life human character, natural skin texture, believable hands, expressive eyes, grounded facial detail",
  place:
    "real-world location, believable architecture, lived-in detail, atmospheric realism, natural depth",
  scene:
    "cinematic real-life scene, layered depth, believable props, environmental storytelling, documentary realism",
  product:
    "premium product photography, tactile material detail, polished lighting, commercial realism"
};

const styleDescriptors: Record<GenerationStyle, string> = {
  cinematic:
    "cinematic realism, dramatic but believable lighting, high-end camera look",
  editorial:
    "fashion editorial realism, premium composition, clean styling, magazine finish",
  travel:
    "travel documentary realism, natural daylight, rich atmosphere, immersive framing",
  luxury:
    "luxury campaign style, refined color grading, elegant detail, polished brand feel"
};

export function sanitizeGenerationInput(payload: unknown): GenerationInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid request body.");
  }

  const data = payload as Record<string, unknown>;
  const prompt = typeof data.prompt === "string" ? data.prompt.trim() : "";
  const mode =
    typeof data.mode === "string" && validModes.has(data.mode as GenerationMode)
      ? (data.mode as GenerationMode)
      : "image";
  const subject =
    typeof data.subject === "string" &&
    validSubjects.has(data.subject as GenerationSubject)
      ? (data.subject as GenerationSubject)
      : "character";
  const style =
    typeof data.style === "string" &&
    validStyles.has(data.style as GenerationStyle)
      ? (data.style as GenerationStyle)
      : "cinematic";
  const aspectRatio =
    typeof data.aspectRatio === "string" &&
    validAspectRatios.has(data.aspectRatio as AspectRatio)
      ? (data.aspectRatio as AspectRatio)
      : "3:4";
  const duration =
    typeof data.duration === "number" && Number.isFinite(data.duration)
      ? Math.min(10, Math.max(3, Math.round(data.duration)))
      : 5;
  const motionHint =
    typeof data.motionHint === "string" ? data.motionHint.trim() : "";
  const addSoundtrack = Boolean(data.addSoundtrack);

  if (prompt.length < 6) {
    throw new Error("Please enter a more detailed prompt.");
  }

  return {
    prompt,
    mode,
    subject,
    style,
    aspectRatio,
    duration,
    motionHint,
    addSoundtrack
  };
}

export function buildEnhancedPrompt(input: GenerationInput) {
  const pieces = [
    input.prompt,
    subjectDescriptors[input.subject],
    styleDescriptors[input.style],
    "photorealistic, detailed textures, clean composition, high quality, realistic lighting"
  ];

  if (input.mode === "video") {
    pieces.push(
      "short-form video shot, smooth motion, coherent action, stable framing"
    );

    if (input.motionHint) {
      pieces.push(input.motionHint);
    }

    if (input.addSoundtrack) {
      pieces.push("cinematic soundtrack mood");
    }
  }

  return pieces.join(", ");
}

export function buildProviderRequest(
  input: GenerationInput,
  enhancedPrompt: string
) {
  const encodedPrompt = encodeURIComponent(enhancedPrompt);
  const headers = new Headers();

  if (process.env.POLLINATIONS_API_KEY) {
    headers.set("Authorization", `Bearer ${process.env.POLLINATIONS_API_KEY}`);
  }

  const params = new URLSearchParams({
    model: input.mode === "image" ? "flux" : "seedance",
    aspectRatio: input.aspectRatio
  });

  if (input.mode === "video") {
    params.set("duration", String(input.duration || 5));
    params.set("audio", input.addSoundtrack ? "true" : "false");
  }

  return {
    url: `https://gen.pollinations.ai/${
      input.mode === "image" ? "image" : "video"
    }/${encodedPrompt}?${params.toString()}`,
    init: {
      cache: "no-store" as const,
      headers
    }
  };
}

export async function readProviderError(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as
      | { error?: string | { message?: string } }
      | undefined;

    if (typeof payload?.error === "string") {
      return payload.error;
    }

    if (
      payload?.error &&
      typeof payload.error === "object" &&
      typeof payload.error.message === "string"
    ) {
      return payload.error.message;
    }
  }

  const text = await response.text();

  if (text) {
    return text.slice(0, 240);
  }

  return `Provider request failed with status ${response.status}.`;
}
