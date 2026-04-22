import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b",
      {
        input: {
          prompt: prompt,
          width: 768,
          height: 1024
        }
      }
    );

    return Response.json({
      success: true,
      image: output[0]
    });
  } catch (error) {
    return Response.json(
      { success: false },
      { status: 500 }
    );
  }
}
