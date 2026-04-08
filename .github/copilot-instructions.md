# Copilot Instructions

## プロジェクト概要

Tesla 車両輸送船（自動車専用船）の横浜港入出港スケジュールを追跡する SPA。
GitHub Actions で定期スクレイピングし、GitHub Pages でホスト。

## 技術スタック

- **Framework**: React 19 + Vite
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Date**: date-fns
- **Package Manager**: pnpm
- **Scraping**: Cheerio + iconv-lite
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## 言語とスタイル

- コードのコメントとコミットメッセージは英語
- UI テキストは日本語
- 公式な製品名・サービス名は英語のまま使用

## コーディング規約

- ファイル名は kebab-case
- コンポーネント名は PascalCase
- shadcn/ui コンポーネントを優先使用
- `cn()` でクラス名を合成
- パスエイリアス `@/` → `src/`

## Git ルール

- Conventional Commits 形式
- Squash merge 推奨
