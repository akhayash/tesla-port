---
name: ui-ux-design
description: UI/UX の画面設計を行い、コンポーネント方針と体験設計を定義する。
---

# UI/UX Design

## 目的

UI/UX の設計を行い、ユーザー体験を高品質にするための画面構成、コンポーネント方針、状態別 UI を定義する。

## 使う agent

- `designer`

## 入力

- `docs/requirements/<feature>.md`（要求定義）
- `docs/design/<feature>-architecture.md`（全体設計）
- 既存の UI コンポーネント

## 出力

- `docs/ui/<feature>-ui-design.md`

## 手順

1. 要求定義と設計書を確認する
2. 画面構成を定義する
3. 情報の階層と優先度を整理する
4. レイアウトを設計する（余白、密度、視線誘導）
5. コンポーネントの見せ方を定義する
6. 状態別 UI を設計する（loading, empty, error, success）
7. ナビゲーションフローを整理する
8. 文言方針を定める
9. 既存 UI との一貫性を確認する
10. アクセシビリティを検討する

## テンプレート

- `templates/ui-design-template.md`
