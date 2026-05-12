export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;
    const sessionId = body.sessionId;

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message invalide." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      return Response.json(
        { error: "Webhook n8n non configuré." },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET
          ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({
        message,
        sessionId,
        source: "site-etudiant",
      }),
    });

    if (!response.ok) {
      return Response.json(
        { error: "Erreur côté n8n." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      answer: data.answer ?? data.response ?? data.text ?? data,
    });
  } catch {
    return Response.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}