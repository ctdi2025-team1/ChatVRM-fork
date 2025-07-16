import React from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message } from "@/features/messages/messages";
import {
  KoeiroParam,
  PRESET_A,
  PRESET_B,
  PRESET_C,
  PRESET_D,
} from "@/features/constants/koeiroParam";
import { Link } from "./link";

type Props = {
  googleApiKey: string;
  systemPrompt: string;
  chatLog: Message[];
  koeiroParam: KoeiroParam;
  geminiModel: string;
  koeiromapKey: string;
  ttsService: string;
  aivisSpeechUrl: string;
  aivisSpeakerId: number;
  onClickClose: () => void;
  onChangeGoogleApiKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onChangeGeminiModel: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  onChangeKoeiromapKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeTtsService: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeAivisSpeechUrl: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeAivisSpeakerId: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};
export const Settings = ({
  googleApiKey,
  chatLog,
  systemPrompt,
  koeiroParam,
  geminiModel,
  koeiromapKey,
  ttsService,
  aivisSpeechUrl,
  aivisSpeakerId,
  onClickClose,
  onChangeSystemPrompt,
  onChangeGoogleApiKey,
  onChangeChatLog,
  onChangeKoeiroParam,
  onChangeGeminiModel,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  onChangeKoeiromapKey,
  onChangeTtsService,
  onChangeAivisSpeechUrl,
  onChangeAivisSpeakerId,
}: Props) => {
  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur ">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
        ></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-3xl mx-auto px-24 py-64 ">
          <div className="my-24 typography-32 font-bold">設定</div>
          <div className="my-24">
            <div className="my-16 typography-20 font-bold">Google API キー</div>
            <input
              className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
              type="text"
              placeholder="AIza..."
              value={googleApiKey}
              onChange={onChangeGoogleApiKey}
            />
            <div>
              APIキーは
              <Link
                url="https://aistudio.google.com/app/apikey"
                label="Google AI Studio"
              />
              で取得できます。取得したAPIキーをフォームに入力してください。
            </div>
            <div className="my-16 typography-20 font-bold">Gemini モデル</div>
            <select
              className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
              value={geminiModel}
              onChange={onChangeGeminiModel}
            >
              <option value="gemini-2.0-flash-001">Gemini 2.0 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-flash-lite-preview-06-17">Gemini 2.5 Flash Lite Preview</option>
            </select>
            <div className="my-16">
              Gemini
              APIはブラウザから直接アクセスしています。また、APIキーや会話内容はピクシブのサーバには保存されません。
            </div>
          </div>
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">
              キャラクターモデル
            </div>
            <div className="my-8">
              <TextButton onClick={onClickOpenVrmFile}>VRMを開く</TextButton>
            </div>
          </div>
          <div className="my-40">
            <div className="my-8">
              <div className="my-16 typography-20 font-bold">
                キャラクター設定（システムプロンプト）
              </div>
              <TextButton onClick={onClickResetSystemPrompt}>
                キャラクター設定リセット
              </TextButton>
            </div>

            <textarea
              value={systemPrompt}
              onChange={onChangeSystemPrompt}
              className="px-16 py-8  bg-surface1 hover:bg-surface1-hover h-168 rounded-8 w-full"
            ></textarea>
          </div>
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">声の調整</div>
            <div className="my-16 font-bold">TTS サービス</div>
            <select
              className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
              value={ttsService}
              onChange={onChangeTtsService}
            >
              <option value="koeiromap">Koeiromap (Koemotion)</option>
              <option value="aivis">Aivis Speech</option>
            </select>
            
            {ttsService === "koeiromap" && (
              <>
                <div className="mt-16">
                  KoemotionのKoeiromap APIを使用しています。詳しくは
                  <Link
                    url="https://koemotion.rinna.co.jp"
                    label="https://koemotion.rinna.co.jp"
                  />
                  をご覧ください。
                </div>
                <div className="mt-16 font-bold">API キー</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={koeiromapKey}
                    onChange={onChangeKoeiromapKey}
                  />
                </div>
              </>
            )}
            
            {ttsService === "aivis" && (
              <>
                <div className="mt-16">
                  Aivis Speechのローカルサーバーを使用します。
                </div>
                <div className="mt-16 font-bold">サーバー URL</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="http://127.0.0.1:10101"
                    value={aivisSpeechUrl}
                    onChange={onChangeAivisSpeechUrl}
                  />
                </div>
                <div className="mt-16 font-bold">話者 ID</div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={aivisSpeakerId}
                  onChange={onChangeAivisSpeakerId}
                >
                  <option value={888753760}>Anneli (ノーマル)</option>
                  <option value={888753761}>Anneli (通常)</option>
                  <option value={888753762}>Anneli (テンション高め)</option>
                  <option value={888753763}>Anneli (落ち着き)</option>
                  <option value={888753764}>Anneli (上機嫌)</option>
                  <option value={888753765}>Anneli (怒り・悲しみ)</option>
                  <option value={1388823424}>凛音エル (ノーマル)</option>
                  <option value={1388823425}>凛音エル (Angry)</option>
                  <option value={1388823426}>凛音エル (Fear)</option>
                  <option value={1388823427}>凛音エル (Happy)</option>
                  <option value={1388823428}>凛音エル (Sad)</option>
                  <option value={1310138976}>もりもっさんメンズ (Normal)</option>
                  <option value={1310138977}>もりもっさんメンズ (Calm)</option>
                  <option value={1310138978}>もりもっさんメンズ (Far)</option>
                  <option value={1310138979}>もりもっさんメンズ (Heavy)</option>
                  <option value={1310138980}>もりもっさんメンズ (Mid)</option>
                  <option value={1310138981}>もりもっさんメンズ (Shout)</option>
                  <option value={1310138982}>もりもっさんメンズ (Surprise)</option>
                </select>
              </>
            )}

            <div className="mt-16 font-bold">プリセット</div>
            <div className="my-8 grid grid-cols-2 gap-[8px]">
              <TextButton
                onClick={() =>
                  onChangeKoeiroParam(PRESET_A.speakerX, PRESET_A.speakerY)
                }
              >
                かわいい
              </TextButton>
              <TextButton
                onClick={() =>
                  onChangeKoeiroParam(PRESET_B.speakerX, PRESET_B.speakerY)
                }
              >
                元気
              </TextButton>
              <TextButton
                onClick={() =>
                  onChangeKoeiroParam(PRESET_C.speakerX, PRESET_C.speakerY)
                }
              >
                かっこいい
              </TextButton>
              <TextButton
                onClick={() =>
                  onChangeKoeiroParam(PRESET_D.speakerX, PRESET_D.speakerY)
                }
              >
                渋い
              </TextButton>
            </div>
            <div className="my-24">
              <div className="select-none">x : {koeiroParam.speakerX}</div>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.001}
                value={koeiroParam.speakerX}
                className="mt-8 mb-16 input-range"
                onChange={(e) => {
                  onChangeKoeiroParam(
                    Number(e.target.value),
                    koeiroParam.speakerY
                  );
                }}
              ></input>
              <div className="select-none">y : {koeiroParam.speakerY}</div>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.001}
                value={koeiroParam.speakerY}
                className="mt-8 mb-16 input-range"
                onChange={(e) => {
                  onChangeKoeiroParam(
                    koeiroParam.speakerX,
                    Number(e.target.value)
                  );
                }}
              ></input>
            </div>
          </div>
          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-8 grid-cols-2">
                <div className="my-16 typography-20 font-bold">会話履歴</div>
                <TextButton onClick={onClickResetChatLog}>
                  会話履歴リセット
                </TextButton>
              </div>
              <div className="my-8">
                {chatLog.map((value, index) => {
                  return (
                    <div
                      key={index}
                      className="my-8 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed"
                    >
                      <div className="w-[64px] py-8">
                        {value.role === "assistant" ? "Character" : "You"}
                      </div>
                      <input
                        key={index}
                        className="bg-surface1 hover:bg-surface1-hover rounded-8 w-full px-16 py-8"
                        type="text"
                        value={value.content}
                        onChange={(event) => {
                          onChangeChatLog(index, event.target.value);
                        }}
                      ></input>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
