---
name: requirements-to-stories
description: ユーザー要求を構造化し、user story と acceptance criteria に変換する。
---

# Requirements to Stories

## 目的

ユーザーの発話や要求を構造化し、開発可能な形の user story と acceptance criteria に変換する。

## 使う agent

- `business-analyst`

## 入力

- ユーザーの要求（発話、メモ、要件書など）

## 出力

- `docs/requirements/<feature>.md`

## 手順

1. ユーザー発話を読み取り、要求の本質を整理する
2. business goal を明文化する
3. stakeholder / actor を特定する
4. user story を「As a ... I want ... So that ...」形式で記述する
5. 各 story に acceptance criteria を GIVEN-WHEN-THEN 形式で記述する
6. business rule / constraint を整理する
7. out of scope を明確にする
8. open questions をリストアップする

## テンプレート

- `templates/requirements-template.md`
