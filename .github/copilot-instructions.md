# Copilot Instructions

## プロジェクト概要

<!-- プロジェクトの概要を記述してください -->

## 言語とスタイル

- コードのコメントとコミットメッセージは英語
- ドキュメント（docs/ 配下）は日本語
- 公式な製品名・サービス名は英語のまま使用

## 技術スタック

<!-- プロジェクトの技術スタックを記述してください。例: -->
<!-- - **Framework**: Next.js (App Router) -->
<!-- - **Language**: TypeScript -->
<!-- - **Styling**: Tailwind CSS -->
<!-- - **Deploy**: Azure -->

技術スタック固有の規約は `.github/instructions/` 配下の対応ファイルを参照。

## コーディング規約

- ファイル名は kebab-case
- テストは `__tests__/` または `*.test.*` に配置
- 詳細は `.github/instructions/implementation.instructions.md` を参照

## Agent / Skill 構成

このリポジトリは Copilot CLI のカスタム Agent / Skill 構成を採用しています。
詳細は `AGENTS.md` を参照してください。

- Agent 定義: `.github/agents/`
- Skill 定義: `.github/skills/`
- 横断的指示: `.github/instructions/`

## Backlog 管理

タスク管理には **Backlog.md** を使用する（`backlog/` 配下に Markdown ファイルとして保存）。
詳細は `AGENTS.md` の「Backlog 管理」セクションを参照。

## Git ルール

### ブランチ戦略

- `main`: 本番リリース可能な状態を常に維持
- `feature/<task-id>-<description>`: 機能開発（例: `feature/TASK-1-add-login`）
- `fix/<task-id>-<description>`: バグ修正
- `chore/<description>`: 設定・ドキュメント変更

### コミット規約

[Conventional Commits](https://www.conventionalcommits.org/) 形式を使用:

```
feat: ログイン画面を追加
fix: トークン更新のタイミングを修正
docs: API 仕様書を更新
chore: ESLint 設定を調整
refactor: 認証ロジックを分離
test: ログインの unit test を追加
```

### PR 運用ルール

- **1 タスク = 1 PR** を原則とする（Backlog.md のタスク ID を PR タイトルに含める）
- PR 作成前に lint / type-check / test を通す
- PR の description は `.github/pull_request_template.md` に沿って記入する
- **マージ前にレビュー必須**（人または agent のレビュー）
- マージ方法は **Squash merge** を推奨（履歴をクリーンに保つ）
