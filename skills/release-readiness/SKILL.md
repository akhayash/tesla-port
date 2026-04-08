---
name: release-readiness
description: 出荷判定を行い、リリース可否を判断するための情報を整理する。
---

# Release Readiness

## 目的

リリース前の最終確認として、品質・セキュリティ・運用の観点から出荷可否を判断する。

## 使う agent

- `pm`
- `qa`
- `devops-azure`

## 入力

- テスト結果
- QA review note
- セキュリティレビュー結果
- デプロイ計画
- PR summary

## 出力

- known risks
- rollback 観点
- 未解決事項
- 出荷可否メモ

## 手順

1. テスト結果を確認する（全テスト PASS か）
2. QA review note を確認する（品質懸念がないか）
3. セキュリティレビュー結果を確認する（重大な懸念がないか）
4. デプロイ計画を確認する（ロールバック手順があるか）
5. known risks を整理する
6. 未解決事項を確認する
7. 出荷可否を判断する

## 判断基準

- すべてのテストが PASS している
- セキュリティレビューで重大な指摘がない
- ロールバック手順が定義されている
- known risks のリスクレベルが許容範囲内
- open questions が出荷をブロックしない
