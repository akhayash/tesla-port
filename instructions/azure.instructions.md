# Azure Instructions

> Azure サービスの詳細な仕様・API は Microsoft Learn MCP で取得する。
> ここには設計・運用の判断基準と規約のみ記載する。

## ホスティングサービス選定

| サービス | 適するケース |
|---------|------------|
| **Container Apps** | コンテナベース Web アプリ、マイクロサービス |
| **App Service** | 伝統的な Web アプリ、簡易デプロイ |
| **Static Web Apps** | 静的サイト + サーバーレス API |
| **Functions** | イベント駆動、バッチ処理、サーバーレス |

architect と協議し、要件に最適なサービスを選定する。

## リソース命名規則

| リソース | 形式 | 例 |
|---------|------|-----|
| Resource Group | `rg-<project>-<env>` | `rg-hve-agent-prod` |
| Container Apps | `ca-<project>-<env>` | `ca-hve-agent-prod` |
| Container Registry | `cr<project><env>` | `crhveagentprod` |
| App Service | `app-<project>-<env>` | `app-hve-agent-prod` |
| Static Web App | `swa-<project>-<env>` | `swa-hve-agent-prod` |
| Key Vault | `kv-<project>-<env>` | `kv-hve-agent-prod` |
| Application Insights | `ai-<project>-<env>` | `ai-hve-agent-prod` |

## Bicep IaC

### ファイル構成

```
infra/
  main.bicep          # エントリーポイント
  modules/
    app-service.bicep  # App Service モジュール
    keyvault.bicep     # Key Vault モジュール
  parameters/
    dev.bicepparam     # dev 環境パラメータ
    staging.bicepparam
    prod.bicepparam
```

### Bicep ルール

- モジュール化して再利用可能にする
- パラメータファイルで環境差分を管理する
- `@secure()` デコレータで秘密情報パラメータを保護する
- output でデプロイ後の情報（URL, ID）を返す

## GitHub Actions + Azure

### OIDC 認証（推奨）

```yaml
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

### 必要な GitHub Secrets

| Secret | 用途 |
|--------|------|
| `AZURE_CLIENT_ID` | OIDC アプリケーション ID |
| `AZURE_TENANT_ID` | Azure AD テナント ID |
| `AZURE_SUBSCRIPTION_ID` | サブスクリプション ID |

## 環境管理

| 環境 | 用途 | デプロイ条件 |
|------|------|------------|
| dev | 開発検証 | PR マージ時自動 |
| staging | リリース前検証 | main ブランチ push 時自動 |
| production | 本番 | 手動承認ゲート必須 |

## モニタリング

- Application Insights でアプリケーションメトリクスを収集
- Azure Monitor でインフラメトリクスを監視
- アラートルールを設定（レスポンスタイム、エラー率）
