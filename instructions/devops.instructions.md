# DevOps Instructions

## CI/CD 方針

### GitHub Actions

- PR 作成時: lint + build + test
- main マージ時: build + deploy (staging)
- リリースタグ時: build + deploy (production)

### ブランチ戦略

- `main`: 本番リリース可能な状態を維持
- `develop`: 開発統合ブランチ（必要に応じて）
- `feature/*`: 機能開発ブランチ

### デプロイ

- IaC でインフラを定義する（`infra/` に配置）
- 環境は staging → production の段階デプロイ
- ロールバック手順を必ず定義する

### 環境管理

- GitHub Environments で staging / production を分離
- Secrets は GitHub Secrets + クラウドの Secrets Manager で管理
- Production デプロイには承認ゲートを設定

## デプロイ計画

デプロイ計画は `docs/devops/<feature>-deployment-plan.md` に出力する。

### 計画に含めるもの

1. デプロイ対象と影響範囲
2. 前提条件と依存関係
3. デプロイ手順
4. ロールバック手順
5. モニタリングとアラート
6. 承認者と承認基準

## クラウド固有の規約

クラウドプロバイダー別の詳細は各 instruction ファイルを参照:

- Azure: `.github/instructions/azure.instructions.md`
