---
applyTo: "**"
---

# Tesla Port — 車両輸送船トラッカー

## プロジェクト概要
横浜港の入出港予定船情報から Tesla 車両輸送船（自動車専用船）のスケジュールを追跡する SPA。

## 技術スタック
- **Framework**: React 19 + Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (base-nova)
- **Icons**: lucide-react
- **Date**: date-fns
- **Package Manager**: pnpm
- **Hosting**: GitHub Pages
- **Scraping**: Cheerio + iconv-lite (GitHub Actions)

## アーキテクチャ
- フロントエンドは静的 SPA（GitHub Pages でホスト）
- データは GitHub Actions の cron ジョブでスクレイピングし `data/*.json` に保存
- サーバーサイドコンポーネントなし

## コーディング規約
- ファイル名: kebab-case
- コンポーネント: PascalCase
- shadcn/ui のコンポーネントを優先的に使用
- `cn()` でクラス名を合成
- 日本語の UI テキスト、英語のコード・コメント
- date-fns で日時フォーマット（日本語ロケール）

## データフロー
1. GitHub Actions (cron) → スクレイピング → data/ships.json にコミット
2. フロントエンド → fetch data/ships.json → 表示

## スクレイピング対象
- URL: http://www.port.city.yokohama.jp/APP/Pves0040InPlanC
- 文字コード: Shift_JIS
- フィルタ: 船種 = 自動車専用船
