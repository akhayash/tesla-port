# AGENTS.md — hve-agent

このリポジトリでは Copilot CLI のカスタム Agent / Skill 構成を採用しています。

## 全体方針

- **Agent**: 役割ベース（誰がやるか）
- **Skill**: 工程ベース（何をするか）
- **Backlog**: Backlog.md で管理（Markdown ネイティブ、Git 追跡可能）
- **実装**: UI / Backend に分けて並列化
- **人の役割**: レビューと承認中心

## Agent 一覧

### 汎用 Agent（tech stack に依存しない）

| Agent | 役割 |
|-------|------|
| `business-analyst` | 要求整理 |
| `pm` | 進行・backlog 管理・特化型 agent の呼び出し |
| `architect` | 全体設計・tech stack 選定 |
| `designer` | UI/UX 設計 |
| `tester` | テスト作成 |
| `qa` | 品質判定 |
| `security` | セキュリティレビュー |

### 特化型 Agent（tech stack 別）

| Agent | 技術 | 用途 |
|-------|------|------|
| `programmer-nextjs` | Next.js + TypeScript + Tailwind | Web アプリ実装 |
| `programmer-streamlit` | Python + Streamlit | データアプリ・ダッシュボード実装 |
| `programmer-dotnet` | .NET 9 + C# + ASP.NET Core + xUnit | .NET バックエンド API 実装 |
| `devops-azure` | Azure + Bicep + GitHub Actions | Azure デプロイ・IaC |

> 新しい tech stack が必要になったら、特化型 agent と対応する instruction を追加する。

## Skill 一覧

| Skill | 工程 | 使う Agent |
|-------|------|-----------|
| `requirements-to-stories` | 要求整理 | business-analyst |
| `overall-architecture-design` | 全体設計 | architect |
| `ui-ux-design` | UI/UX 設計 | designer |
| `feature-implementation` | 実装 | programmer-nextjs, programmer-streamlit, programmer-dotnet |
| `test-strategy` | テスト設計 | tester |
| `security-review` | セキュリティ | security |
| `devops-delivery` | CI/CD・デプロイ | devops-azure |
| `release-readiness` | 出荷判定 | pm, qa, devops-azure |

## 実行フロー

```
1. 要求入力 → business-analyst
2. 要求整理 → business-analyst (requirements-to-stories)
   └─ レビュー: architect が技術実現性を確認
   🔒 承認ゲート: 人が仕様を確認・承認

3. タスク化 → pm（Backlog.md でタスク作成・優先順位付け）

4. 全体設計 → architect (overall-architecture-design)
   └─ レビュー: business-analyst（仕様整合性）+ security + devops-azure
   🔒 承認ゲート: 人が設計を確認・承認

5. UI/UX設計 → designer (ui-ux-design)
   └─ レビュー: business-analyst（仕様整合性）+ architect（設計整合性）

6. 実装 → 特化型 agent（例: programmer-nextjs, programmer-dotnet）
7. テスト作成 → tester
   └─ レビュー: qa（網羅性確認）
8. セキュリティレビュー → security
9. デプロイ準備 → devops-azure
   └─ レビュー: pm（リリース判断）

10. PR → 人がレビュー・マージ
```

## Agent 間レビュー体制

各工程の成果物は、別の agent がレビューしてから次のフェーズに進む。

| 成果物 | 作成者 | レビュー担当 | レビュー観点 |
|--------|--------|-------------|------------|
| 仕様（User Story + AC） | business-analyst | architect | 技術実現性 |
| 設計書 | architect | business-analyst + security + devops-azure | 仕様整合性 + セキュリティ + 運用 |
| UI 設計書 | designer | business-analyst + architect | 仕様整合性 + 設計整合性 |
| テスト計画 | tester | qa | 網羅性・回帰リスク |
| コード | programmer-* | tester + security | テスト + セキュリティ |
| デプロイ計画 | devops-azure | pm | リリース判断 |

## 承認ゲート

以下の 2 箇所で**人の承認**を必須とする。agent だけで先に進めない。

| ゲート | タイミング | 承認者 | 確認内容 |
|--------|-----------|--------|---------|
| 🔒 **仕様承認** | 要求整理完了後 | 人（PO / PM） | User Story と AC が妥当か |
| 🔒 **設計承認** | 全体設計完了後 | 人（Tech Lead） | アーキテクチャが妥当か |

コードは **PR レビュー** で人が確認・マージする。

## Backlog 管理

タスク管理には **Backlog.md** を使用する。
ドキュメント成果物は **docs/** に出力し、Backlog.md タスクからリンクする。

### 二層構造

| 層 | 場所 | 役割 |
|----|------|------|
| **追跡台帳** | Backlog.md（`backlog/`） | タスクの進行管理・ステータス・依存関係 |
| **成果物** | `docs/` | 人が読みやすいドキュメント（要件、設計、テスト計画など） |

タスク作成時に `--doc docs/<path>` でドキュメントへのリンクを付ける。

### ラベル体系

| ラベル | 用途 | 主な使用 agent |
|--------|------|---------------|
| `epic` | 大きな機能群 | pm |
| `story` | ユーザー価値単位 | business-analyst |
| `bug` | 不具合 | tester, qa |
| `spike` | 技術調査 | architect |
| `chore` | 保守・雑務 | 全般 |
| `design` | 設計タスク（アーキテクチャ・UI） | architect, designer |
| `infra` | インフラ・CI/CD | devops-azure |
| `test` | テスト計画・実装 | tester |
| `security` | セキュリティレビュー | security |

### ステータスフロー

```
To Do → In Progress → Review → Done
```

- **To Do**: 作業待ち
- **In Progress**: 作業中
- **Review**: PR レビュー待ち
- **Done**: 完了

### Definition of Done（全タスク共通）

新規タスクには以下の DoD が自動付与される：

- [ ] テスト通過
- [ ] lint / type-check 通過
- [ ] セルフレビュー完了
- [ ] 設計書との差異なし

> **注意**: 設計タスク（`design`）、技術調査（`spike`）、ドキュメント作成など実装を伴わないタスクでは `--no-dod-defaults` を使い、タスクに適した DoD を個別に設定する。

### 基本コマンド

```bash
# タスク管理
backlog task create "タスク名" -l story --priority high    # ラベル・優先度付き
backlog task create "サブタスク" -p TASK-1                  # サブタスク
backlog task create "タスク" --doc docs/design/feature.md   # ドキュメントリンク付き
backlog task create "タスク" --ac "基準1" --ac "基準2"      # Acceptance Criteria 付き
backlog task create "タスク" --dep task-1,task-2            # 依存関係付き
backlog task edit TASK-1 -s "In Progress"                   # ステータス変更
backlog task list -l epic                                   # ラベルで絞り込み
backlog board                                               # Kanban ボード

# ドキュメント・意思決定
backlog doc create "Architecture: Feature X"                # ドキュメント追跡
backlog decision create "Use PostgreSQL"                    # 意思決定記録
backlog search "キーワード"                                 # 全文検索
```

### ルール

- 追跡価値のある単位だけをタスクにする
- 細かい作業はタスク内のチェックリストにとどめる
- 依存関係は `--dep` オプションで明示する
- ドキュメント成果物は `docs/` に出力し、タスクからリンクする

## ドキュメント出力先

| カテゴリ | パス |
|---------|------|
| 要求定義 | `docs/requirements/` |
| 設計書 | `docs/design/` |
| UI 設計 | `docs/ui/` |
| テスト計画 | `docs/test/` |
| セキュリティ | `docs/security/` |
| DevOps | `docs/devops/` |
| 意思決定記録 | `docs/decisions/` |

## ファイル構成

- `.github/agents/` — Agent 定義
- `.github/skills/` — Skill 定義
- `.github/instructions/` — 横断的な指示
- `.github/copilot-instructions.md` — Copilot 全体指示
- `backlog/` — Backlog.md タスク管理

<!-- BACKLOG.MD MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:
- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and finalization
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->
