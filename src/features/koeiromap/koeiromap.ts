import { TalkStyle } from "../messages/messages";

export async function koeiromapV0(
  message: string,
  speakerX: number,
  speakerY: number,
  style: TalkStyle
) {
  const param = {
    method: "POST",
    body: JSON.stringify({
      text: message,
      speaker_x: speakerX,
      speaker_y: speakerY,
      style: style,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  };

  const koeiroRes = await fetch(
    // "https://api.rinna.co.jp/models/cttse/koeiro",
    "https://api.rinna.co.jp/koemotion/infer",
    param
  );

  const data = (await koeiroRes.json()) as any;

  return { audio: data.audio };
}

export async function aivisSpeech(
  message: string,
  speakerId: number = 888753760,
  speed: number = 1.0,
  pitch: number = 0.0,
  baseUrl: string = "http://127.0.0.1:10101"
) {
  try {
     // ★ ここでメッセージ整形！
    message = message.trim().replace(/\s+/g, ' ').replace(/\n/g, '');

    console.log(`Aivis Speech: Calling ${baseUrl} with message: "${message}", speaker: ${speakerId}`);
    
    // 1. まずaudio_queryでテキストを解析
    const queryUrl = `${baseUrl}/audio_query?text=${encodeURIComponent(message)}&speaker=${speakerId}`;
    console.log("Audio query URL:", queryUrl);
    
    const queryRes = await fetch(queryUrl, {
      method: "POST"
    });

    console.log("Audio query response status:", queryRes.status);
    
    if (!queryRes.ok) {
      const errorText = await queryRes.text();
      console.error("Audio query error response:", errorText);
      throw new Error(`Aivis Speech audio query error: ${queryRes.status} - ${errorText}`);
    }

    const audioQuery = await queryRes.json();
    console.log("Audio query successful");
    
    // 2. 音声合成パラメーターを調整
    const synthData = {
      ...audioQuery,
      speedScale: speed,
      pitchScale: pitch,
      intonationScale: 1.0,
      volumeScale: 1.0,
      prePhonemeLength: 0.1,
      postPhonemeLength: 0.1,
      outputSamplingRate: 24000,
      outputStereo: false
    };
    
    // 3. synthesisで音声を合成
    const synthUrl = `${baseUrl}/synthesis?speaker=${speakerId}`;
    console.log("Synthesis URL:", synthUrl);
    
    const synthRes = await fetch(synthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(synthData)
    });

    console.log("Synthesis response status:", synthRes.status);
    
    if (!synthRes.ok) {
      const errorText = await synthRes.text();
      console.error("Synthesis error response:", errorText);
      throw new Error(`Aivis Speech synthesis error: ${synthRes.status} - ${errorText}`);
    }

    const audioBuffer = await synthRes.arrayBuffer();
    console.log("Audio buffer size:", audioBuffer.byteLength);
    
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    console.log("Base64 audio length:", base64Audio.length);

    // ここに追加 ↓↓↓
    console.log("Base64 head:", base64Audio.substring(0, 100) + "...");

    return { audio: base64Audio };
  } catch (error) {
    console.error("Aivis Speech error:", error);
    throw error;
  }
}

export async function koeiromapFreeV1(
  message: string,
  speakerX: number,
  speakerY: number,
  style: "talk" | "happy" | "sad",
  apiKey: string
) {
  // Request body
  const body = {
    text: message,
    speaker_x: speakerX,
    speaker_y: speakerY,
    style: style,
    output_format: "mp3",
  };

  const koeiroRes = await fetch(
    // "https://api.rinna.co.jp/koeiromap/v1.0/infer",
    "https://api.rinna.co.jp/koemotion/infer",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
    }
  );

  const data = (await koeiroRes.json()) as any;

  return { audio: data.audio };
}
