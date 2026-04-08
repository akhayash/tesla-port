---
name: devops-delivery
description: CI/CD パイプライン、デプロイ設計、環境構築を行う。
---

# DevOps Delivery

## 目的

CI/CD パイプラインの設計・構築、デプロイ計画の策定、インフラの管理を行う。

## 使う agent

- `devops-azure`

## 入力

- `docs/design/<feature>-architecture.md`（設計書）
- 既存の CI/CD 設定
- インフラ構成

## 出力

- `docs/devops/<feature>-deployment-plan.md`
- workflow / pipeline 差分
- infra 差分

## 手順

1. 設計書からデプロイ要件を確認する
2. CI/CD パイプラインの変更要否を判断する
3. 必要であれば workflow を作成・更新する
4. デプロイ計画を策定する
5. インフラ変更が必要であれば IaC を更新する
6. ロールバック手順を定義する
7. モニタリング・アラートの設定を確認する

## テンプレート

- `templates/workflow-template.md`
- `templates/deployment-plan-template.md`

## スクリプト

- `scripts/validate-pipeline.sh`
