---
name: feature-implementation
description: 実装手順を整理し、変更対象とセルフチェック・検証手順を定義する。
---

# Feature Implementation

## 目的

設計書に基づいて実装手順を整理し、品質を保ちながら効率的に実装を進める。

## 使う agent

- `programmer-nextjs`
- `programmer-streamlit`

## 入力

- `docs/design/<feature>-architecture.md`（全体設計）
- `docs/ui/<feature>-ui-design.md`（UI 設計、UI 実装時）
- 既存のコードベース

## 出力

- コード差分（PR）

## 手順

1. 設計書を確認し、実装範囲を特定する
2. 変更対象ファイルを洗い出す
3. 実装順序を決める（依存関係を考慮）
4. 型定義から始める（API 契約の型を先に）
5. ビジネスロジックを実装する
6. UI / API エンドポイントを実装する
7. セルフチェックリストに沿って確認する
8. テストを実行して通ることを確認する
9. lint / type-check を通す

## チェックリスト

- `checklists/implementation-checklist.md`

## 検証スクリプト

- `scripts/verify.sh`
