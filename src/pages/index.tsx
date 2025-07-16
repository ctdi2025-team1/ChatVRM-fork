import { useCallback, useContext, useEffect, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/googleGeminiChat";

import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [googleApiKey, setGoogleApiKey] = useState(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
      ""
  );
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash-001");
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [ttsService, setTtsService] = useState("koeiromap");
  const [aivisSpeechUrl, setAivisSpeechUrl] = useState("http://127.0.0.1:10101");
  const [aivisSpeakerId, setAivisSpeakerId] = useState(888753760);

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt ?? SYSTEM_PROMPT);
      setKoeiroParam(params.koeiroParam ?? DEFAULT_PARAM);
      setGeminiModel(params.geminiModel ?? "gemini-2.0-flash-001");
      setChatLog(params.chatLog ?? []);
      setTtsService(params.ttsService ?? "koeiromap");
      setAivisSpeechUrl(params.aivisSpeechUrl ?? "http://127.0.0.1:10101");
      // 古い設定値（1）を正しいデフォルト値に修正
      const speakerId = params.aivisSpeakerId;
      setAivisSpeakerId(speakerId === 1 ? 888753760 : speakerId ?? 888753760);
    }
  }, []);

  useEffect(() => {
    process.nextTick(() =>
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ 
          systemPrompt, 
          koeiroParam, 
          geminiModel, 
          chatLog,
          ttsService,
          aivisSpeechUrl,
          aivisSpeakerId
        })
      )
    );
  }, [systemPrompt, koeiroParam, chatLog, geminiModel, ttsService, aivisSpeechUrl, aivisSpeakerId]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });

      setChatLog(newChatLog);
    },
    [chatLog]
  );

  /**
   * 文ごとに音声を直列でリクエストしながら再生する
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      speakCharacter(screenplay, viewer, koeiromapKey, ttsService, aivisSpeechUrl, aivisSpeakerId, onStart, onEnd);
    },
    [viewer, koeiromapKey, ttsService, aivisSpeechUrl, aivisSpeakerId]
  );

  /**
   * アシスタントとの会話を行う
   */
  const handleSendChat = useCallback(
    async (text: string) => {
      if (!googleApiKey) {
        setAssistantMessage("APIキーが入力されていません");
        return;
      }

      const newMessage = text;

      if (newMessage == null) return;

      setChatProcessing(true);
      // ユーザーの発言を追加して表示
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      // Chat GPTへ
      const messages: Message[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ];

      const stream = await getChatResponseStream(messages, googleApiKey, geminiModel).catch(
        (e) => {
          console.error(e);
          return null;
        }
      );
      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          // 返答内容のタグ部分の検出
          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);
          }

          // 返答を一文単位で切り出して処理する
          const sentenceMatch = receivedMessage.match(
            /^(.+[。．！？\n]|.{10,}[、,])/
          );
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            // 発話不要/不可能な文字列だった場合はスキップ
            if (
              !sentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], koeiroParam);
            aiTextLog += aiText;

            // 文ごとに音声を生成 & 再生、返答を表示
            const currentAssistantMessage = sentences.join(" ");
            handleSpeakAi(aiTalks[0], () => {
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
      }

      // アシスタントの返答をログに追加
      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [systemPrompt, chatLog, handleSpeakAi, googleApiKey, geminiModel, koeiroParam]
  );

  return (
    <div className={"font-M_PLUS_2"}>
      <Meta />
      <Introduction
        googleApiKey={googleApiKey}
        koeiroMapKey={koeiromapKey}
        onChangeGoogleApiKey={setGoogleApiKey}
        onChangeKoeiromapKey={setKoeiromapKey}
      />
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
      />
      <Menu
        googleApiKey={googleApiKey}
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        koeiroParam={koeiroParam}
        assistantMessage={assistantMessage}
        geminiModel={geminiModel}
        koeiromapKey={koeiromapKey}
        ttsService={ttsService}
        aivisSpeechUrl={aivisSpeechUrl}
        aivisSpeakerId={aivisSpeakerId}
        onChangeGoogleApiKey={setGoogleApiKey}
        onChangeSystemPrompt={setSystemPrompt}
        onChangeChatLog={handleChangeChatLog}
        onChangeKoeiromapParam={setKoeiroParam}
        onChangeGeminiModel={setGeminiModel}
        handleClickResetChatLog={() => setChatLog([])}
        handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
        onChangeKoeiromapKey={setKoeiromapKey}
        onChangeTtsService={(e: React.ChangeEvent<HTMLSelectElement>) => setTtsService(e.target.value)}
        onChangeAivisSpeechUrl={(e: React.ChangeEvent<HTMLInputElement>) => setAivisSpeechUrl(e.target.value)}
        onChangeAivisSpeakerId={(e: React.ChangeEvent<HTMLSelectElement>) => setAivisSpeakerId(Number(e.target.value))}
      />
      <GitHubLink />
    </div>
  );
}
