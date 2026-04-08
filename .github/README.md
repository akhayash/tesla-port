# agent-playbook

Copilot CLI のカスタム Agent / Skill / Instruction の共通定義リポジトリです。
各システムリポジトリに `git subtree` で `.github/` として配布します。

## 🚀 使い方

### 既存リポジトリに取り込む（subtree）

```bash
cd <your-project>

# 初回: playbook を .github/ に取り込み
git subtree add --prefix=.github \
  https://github.com/akhayash/agent-playbook.git main --squash

# playbook 更新時: 差分を取り込み
git subtree pull --prefix=.github \
  https://github.com/akhayash/agent-playbook.git main --squash
```

### 新規リポジトリに適用

```bash
# リポジトリ作成
gh repo create <your-org>/<project-name> --private --clone
cd <project-name>

# playbook を取り込み
git subtree add --prefix=.github \
  https://github.com/akhayash/agent-playbook.git main --squash
```

### システム固有設定の追加

取り込み後、`.github/instructions/` にシステム固有の instructions を追加してください:

```bash
# 例: inventory-system.instructions.md
cat > .github/instructions/inventory-system.instructions.md << 'EOF'
---
applyTo: "**"
---

# プロジェクト概要
...

## 技術スタック
- Framework: Next.js
- Language: TypeScript
...
EOF
```

`copilot-instructions.md` は共通ルールのため**直接編集しないでください**。
システム固有の設定は必ず `.github/instructions/NAME.instructions.md` に書いてください。

### Agent の呼び出し方

| 環境 | 構文 | 例 |
|------|------|-----|
| Copilot CLI | `#agent名` | `#pm この要件でアプリを作りたい` |
| VS Code | `@agent名` | `@pm この要件でアプリを作りたい` |
| GitHub.com | `@agent名` | `@pm この要件でアプリを作りたい` |

開発を始めるには **`#pm`（または `@pm`）に要件を伝える**だけ。PM がオーケストレーターとして全フェーズを自動的に進行します。

---

## 📐 構成概要

### Agent（役割ベース）

| 種別 | Agent | 役割 |
|------|-------|------|
| 汎用 | `business-analyst` | 要求整理 |
| 汎用 | `pm` | 進行管理・タスク管理 |
| 汎用 | `architect` | 全体設計・tech stack 選定 |
| 汎用 | `designer` | UI/UX 設計 |
| 汎用 | `tester` | テスト作成 |
| 汎用 | `qa` | 品質判定 |
| 汎用 | `security` | セキュリティレビュー |
| 特化型 | `programmer-nextjs` | Next.js 実装 |
| 特化型 | `programmer-streamlit` | Streamlit 実装 |
| 特化型 | `devops-azure` | Azure CI/CD・IaC |

### Skill（工程ベース）

| Skill | 工程 |
|-------|------|
| `requirements-to-stories` | 要求整理 |
| `overall-architecture-design` | 全体設計 |
| `ui-ux-design` | UI/UX 設計 |
| `feature-implementation` | 実装 |
| `test-strategy` | テスト設計 |
| `security-review` | セキュリティ |
| `devops-delivery` | CI/CD・デプロイ |
| `release-readiness` | 出荷判定 |

### 実行フロー

```
1. 要求入力 → business-analyst
2. 要求整理 → business-analyst + architect レビュー
   🔒 仕様承認（人が確認）
3. タスク化 → pm（Backlog.md でタスク作成）
4. 全体設計 → architect + BA/security/devops レビュー
   🔒 設計承認（人が確認）
5. UI/UX設計 → designer + BA/architect レビュー
6. 実装 → 特化型 agent（programmer-nextjs など）
7. テスト・セキュリティレビュー → tester + qa + security
8. PR → 人がレビュー・マージ
```

---

## 📋 Backlog 管理

**Backlog.md** でタスクを管理し、**docs/** に成果物ドキュメントを出力します。

### ラベル

`epic` · `story` · `bug` · `spike` · `chore` · `design` · `infra` · `test` · `security`

### ステータスフロー

`To Do` → `In Progress` → `Review` → `Done`

### よく使うコマンド

```bash
backlog task create "タスク名" -l story --priority high    # タスク作成
backlog task create "サブタスク" -p TASK-1                  # サブタスク
backlog task edit TASK-1 -s "In Progress"                   # ステータス変更
backlog board                                               # Kanban ボード
backlog doc create "Architecture: Feature X"                # ドキュメント追跡
backlog decision create "Use PostgreSQL"                    # 意思決定記録
```

---

## 🔧 特化型 Agent の追加方法

新しい tech stack が必要になったら：

1. `agents/programmer-<stack>.agent.md` を作成
2. `instructions/<stack>.instructions.md` を作成
3. `architect.agent.md` と `pm.agent.md` の特化型テーブルに追記

例: Python Flask を追加する場合
```
.github/agents/programmer-flask.agent.md
.github/instructions/flask.instructions.md
```

---

## 📁 ディレクトリ構成

```
agent-playbook/          ← subtree で .github/ として取り込まれる
├── agents/              ← Agent 定義（11 agent）
├── instructions/        ← 横断的な指示（9 instruction）
├── skills/              ← Skill 定義（8 skill + templates）
├── copilot-instructions.md  ← 共通ルール（編集禁止）
├── pull_request_template.md
├── AGENTS.md            ← 全体方針・フロー
├── backlog/             ← Backlog.md タスク管理
├── docs/                ← 成果物ドキュメント
└── .github/             ← GitHub固有（ISSUE_TEMPLATE等）

取り込み後のシステムリポジトリ:
system-repo/.github/
├── agents/              ← playbook から（共通）
├── instructions/
│   ├── *.instructions.md    ← playbook から（共通）
│   └── system.instructions.md  ← ★システム固有（手動追加）
├── skills/              ← playbook から（共通）
├── copilot-instructions.md  ← playbook から（共通・編集禁止）
└── AGENTS.md            ← playbook から（共通）
```

---

## 📖 詳細

Agent / Skill の詳細な定義、Backlog 管理ルール、MCP 設定については [`AGENTS.md`](AGENTS.md) を参照してください。
