# Tesla Port 🚢

横浜港に入出港する Tesla 車両輸送船（自動車専用船）のスケジュールを追跡するアプリ。

## 機能

- 🔍 横浜港の入出港予定船情報を自動スクレイピング
- 🚗 Tesla 車両輸送に関連する自動車専用船を自動判定
- 📊 入港予定・実績をダッシュボードで表示
- ⏰ 1日2回（6:00 / 18:00 JST）自動更新

## 技術スタック

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- GitHub Actions (スクレイピング + デプロイ)
- GitHub Pages (ホスティング)

## 開発

```bash
pnpm install
pnpm dev
```

## スクレイピング手動実行

```bash
pnpm tsx scripts/scrape.ts
```

## データソース

[横浜港 入出港予定船情報照会](http://www.port.city.yokohama.jp/APP/Pves0040InPlanC)
