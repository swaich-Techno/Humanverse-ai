import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const client = await clientPromise;
    const db = client.db("humanverse");

    await db.collection("prompts").insertOne({
      prompt,
      createdAt: new Date()
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: "Failed to save prompt" },
      { status: 500 }
    );
  }
}
