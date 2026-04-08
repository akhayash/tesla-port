# Next.js Instructions

## App Router 規約

### ファイル構成

```
app/
  layout.tsx          # ルートレイアウト
  page.tsx            # トップページ
  loading.tsx         # ローディング UI
  error.tsx           # エラー UI
  not-found.tsx       # 404 UI
  api/
    <route>/
      route.ts        # API Route
  <feature>/
    page.tsx
    layout.tsx
```

### Server Components vs Client Components

- **デフォルトは Server Component**
- `"use client"` は以下の場合のみ付ける:
  - `useState`, `useEffect` などの hooks を使う
  - ブラウザ API（`window`, `document`）にアクセスする
  - イベントハンドラ（`onClick`, `onChange`）を使う
  - Client-only ライブラリを使う

### データフェッチ

- Server Component 内で直接 `fetch()` または DB アクセス
- Client Component からのデータ取得は Server Actions または API Routes 経由
- `loading.tsx` で Suspense を活用する

### Server Actions

```typescript
"use server";

export async function createItem(formData: FormData) {
  // サーバーサイドで実行される
}
```

## TypeScript 規約

- `strict: true` を維持
- `any` を使わない
- API レスポンスには明示的な型を定義する
- Zod でランタイムバリデーションを行う

## Tailwind CSS 規約

- ユーティリティクラスを活用し、カスタム CSS は最小限に
- レスポンシブは `sm:`, `md:`, `lg:` プレフィックスで対応
- ダークモード対応は `dark:` プレフィックスで
- コンポーネント単位でスタイルをまとめる（Tailwind @apply は控えめに）

## shadcn/ui 規約

- UI コンポーネントは shadcn/ui を優先的に使用する
- `npx shadcn@latest add <component>` でコンポーネントを追加する
- コンポーネントは `components/ui/` に配置される（shadcn のデフォルト）
- shadcn/ui のコンポーネントはプロジェクトにコピーされるため、必要に応じてカスタマイズ可能
- Radix UI プリミティブをベースとしているため、アクセシビリティが確保されている
- `cn()` ユーティリティ（`lib/utils.ts`）でクラス名を合成する

## パフォーマンス

- `next/image` で画像最適化
- `next/font` でフォント最適化
- 動的インポート (`next/dynamic`) で必要時にロード
- Metadata API で SEO 対応
