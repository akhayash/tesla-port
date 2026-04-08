# Testing Instructions

## テスト方針

### テストピラミッド

1. **Unit Test**: ビジネスロジック、ユーティリティ関数
2. **Integration Test**: API Routes、データベースアクセス
3. **E2E Test**: 重要なユーザーフロー

### テストツール

- Unit / Integration: Jest + React Testing Library
- E2E: Playwright（必要に応じて）

### テストファイル配置

- `__tests__/` ディレクトリまたは `*.test.ts(x)` を対象コードの隣に配置
- テストデータは `__fixtures__/` に配置

### テスト命名

```typescript
describe("FeatureName", () => {
  it("should do something when condition is met", () => {
    // ...
  });
});
```

## 品質基準

- ビジネスロジックのカバレッジ: 80% 以上を目標
- API Routes: すべてのエンドポイントに正常系/異常系テスト
- 回帰テスト: バグ修正時に再発防止テストを追加

## テスト計画

テスト計画は `docs/test/<feature>-test-plan.md` に出力する。
