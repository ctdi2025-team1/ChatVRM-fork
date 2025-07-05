import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  ChatSession,
} from "@google/generative-ai";
import { Message } from "../messages/messages";

// Geminiのレスポンスをストリームに変換する
function streamGeminiResponse(
  stream: AsyncGenerator<any, any, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });
}

// Geminiは過去の会話履歴のroleを'user'と'model'にする必要がある
function convertMessagesForGemini(messages: Message[]): { role: string; parts: { text: string }[] }[] {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}


export async function geminiChat(
  messages: Message[],
  apiKey: string,
  model: string = "gemini-1.5-flash"
): Promise<ReadableStream<Uint8Array>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model: model });

  const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  // GeminiではSystemPromptを直接扱えないため、最初のuserメッセージに含めるか、
  // もしくはChatSessionのhistoryの初期値として設定するなどの工夫が必要
  // ここでは簡易的に、最初のuserメッセージの前に連結します。
  if (userMessages.length > 0 && userMessages[0].role === 'user') {
      userMessages[0].content = systemPrompt + "\n" + userMessages[0].content;
  }

  const chat: ChatSession = genModel.startChat({
    history: convertMessagesForGemini(userMessages.slice(0, -1)),
    generationConfig: {
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const lastMessage = userMessages[userMessages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.content);

  return streamGeminiResponse(result.stream);
}