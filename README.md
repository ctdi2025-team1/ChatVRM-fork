# ChatVRM-fork

アバター実験用

## 事前に必要なもの

Google Gemini API Key
- 取得用ページ：https://aistudio.google.com/app/apikey?hl=ja

Koemotion API Key
- 取得方法：https://github.com/rinnakk/Koemotion/blob/master/docs/subscription.md

※いずれも無料枠でそれなりに使用可能

Gemini の API キーは環境変数 `NEXT_PUBLIC_GEMINI_API_KEY` または
`NEXT_PUBLIC_GOOGLE_API_KEY` として設定しておくと
ブラウザ起動時に入力欄へ自動で反映されます。 `.env` ファイルを利用する場合は
以下のように記述してください。

```
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key
# もしくは
NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key
```

## 起動方法

```bash
git clone https://github.com/ctdi2025-team1/ChatVRM-fork.git
cd ChatVRM-fork
npm install
npm run dev # -> localhost:3000にアクセスして、2つのAPIキーを入力
```

## 参考

元リポジトリ
https://github.com/pixiv/ChatVRM
