# Tesla Port 🚢

横浜港に入出港する Tesla 車両輸送船（自動車専用船）のスケジュールを追跡するアプリ。

## 機能

- 🔍 横浜港の入出港予定船情報を自動スクレイピング
- 🚗 Tesla 車両輸送に関連する自動車専用船を自動判定
- 📊 入港予定・実績をダッシュボードで表示
- 🗺️ 詳細画面に VesselFinder への追跡リンクと識別子を表示
- ⏰ 1日2回（6:00 / 18:00 JST）自動更新

## 技術スタック

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- GitHub Actions (スクレイピング + デプロイ)
- GitHub Pages (ホスティング)

## 開発

```bash
pnpm install
pnpm dev
```

## スクレイピング手動実行

```bash
pnpm tsx scripts/scrape.ts
```

デフォルトでは、Tesla候補の船だけ `VesselFinder` の公開検索ページと詳細ページを参照して
`IMO` / `MMSI` を自動補完し、結果を `data/identifier-cache.json` にキャッシュします。

識別子補完は source adapter 経由で差し替え可能です。現在の対応値は:

- `IDENTIFIER_LOOKUP_SOURCE=vesselfinder-scrape`（既定値）
- `IDENTIFIER_LOOKUP_SOURCE=none`

## データソース

[横浜港 入出港予定船情報照会](http://www.port.city.yokohama.jp/APP/Pves0040InPlanC)

## 位置情報表示について

- IMO / MMSI がある船は詳細画面から VesselFinder を直接開ける
- 公開サイトへの iframe 埋め込みは Forbidden になるため、別タブ遷移にしている
- AIS 情報は遅延・欠落・誤差を含む可能性があり、航行判断や安全判断には利用できません
- 識別子補完は現在 `VesselFinder` の公開 HTML を使う scraping source が既定です
- lookup は Tesla候補の船だけに絞り、`data/identifier-cache.json` を優先して外部アクセスを抑えています
