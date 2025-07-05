import { NextApiRequest, NextApiResponse } from "next";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { geminiChat } from "@/features/chat/geminiChat";
import { Message } from "@/features/messages/messages";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { messages, llm, apiKey, model } = req.body;

  const llmApiKey =
    llm === "gemini"
      ? apiKey.gemini || process.env.GEMINI_API_KEY
      : apiKey.openai || process.env.OPENAI_API_KEY;

  if (!llmApiKey) {
    res.status(400).json({
      error: "API key not found.",
    });
    return;
  }

  try {
    let stream: ReadableStream<Uint8Array>;
    if (llm === "gemini") {
      stream = await geminiChat(messages as Message[], llmApiKey, model);
    } else {
      stream = await getChatResponseStream(messages as Message[], llmApiKey, model);
    }

    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      res.write(value);
    }
    res.end();
  } catch (e: any) {
    console.error(e);
    res.status(500).json({
      error: e.message,
    });
  }
}
