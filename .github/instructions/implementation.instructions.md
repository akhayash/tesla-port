# Implementation Instructions

## 実装規約

### 共通

- エラーは適切なエラー型を使い、握りつぶさない
- 入力バリデーションを実装する
- 1 ファイルの責務を単一に保つ

### テスト

- ビジネスロジックには必ず unit test を書く
- API エンドポイントには integration test を書く
- 重要な操作導線にはテストを書く

## コードレビュー観点

- 型安全性が確保されているか
- エラーハンドリングが適切か
- テストが書かれているか
- パフォーマンスへの影響がないか

## 技術スタック固有の規約

tech stack 別の詳細は各 instruction ファイルを参照:

- Next.js: `.github/instructions/nextjs.instructions.md`
- Streamlit: `.github/instructions/streamlit.instructions.md`
