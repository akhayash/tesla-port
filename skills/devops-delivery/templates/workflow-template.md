# Workflow Template: <Feature Name>

## トリガー

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
```

## ジョブ構成

### CI (Pull Request)

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

### Deploy (Main Branch)

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      # Cloud deployment steps
```

## 環境変数

| 変数名 | 用途 | 管理場所 |
|--------|------|---------|
| | | GitHub Secrets |

## 承認フロー

- staging: 自動デプロイ
- production: 手動承認必須
