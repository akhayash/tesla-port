---
name: test-strategy
description: テスト戦略を策定し、テスト観点とテストレベルの割り当てを定義する。
---

# Test Strategy

## 目的

acceptance criteria をテストケースに変換し、テストレベル（unit / integration / E2E）への適切な割り当てを行う。

## 使う agent

- `tester`

## 入力

- `docs/requirements/<feature>.md`（acceptance criteria）
- `docs/design/<feature>-architecture.md`（テスト観点）
- 実装コード

## 出力

- `docs/test/<feature>-test-plan.md`
- テストコード

## 手順

1. acceptance criteria を読み込む
2. 各 criteria をテストケースに変換する
3. テストレベルを割り当てる（unit / integration / E2E）
4. 境界条件を洗い出す
5. 異常系テストケースを追加する
6. テスト計画書を作成する
7. テストコードを実装する

## テンプレート

- `templates/test-plan-template.md`
