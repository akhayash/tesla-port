---
name: overall-architecture-design
description: 実装前の全体設計を行い、システム構造と責務分割を定義する。
---

# Overall Architecture Design

## 目的

実装前に全体設計を行い、システムの構造、責務分割、UI/Backend 間の契約を明確にする。

## 使う agent

- `architect`

## 入力

- `docs/requirements/<feature>.md`（要求定義）
- 既存のアーキテクチャ（コードベース）

## 出力

- `docs/design/<feature>-architecture.md`

## 手順

1. 要求定義を読み込み、実現に必要な機能を洗い出す
2. システム構成を定義する（コンポーネント図）
3. 責務分割を明確にする
4. UI / Backend 間の契約を定義する（API 仕様、型定義）
5. データフローを整理する
6. エラー処理方針を定義する
7. テスト観点を洗い出す
8. セキュリティ影響を評価する
9. 運用影響を評価する
10. リスクを特定し緩和策を記述する

## テンプレート

- `templates/architecture-design-template.md`
