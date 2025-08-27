# JAEN バージョン管理戦略

## Git + GitHub (推奨)

### セットアップ
```bash
cd /Users/peaske/Development/jaen
git init
git remote add origin https://github.com/YOUR_USERNAME/jaen.git
```

### package.json バージョン管理
```json
{
  "name": "jaen",
  "version": "2.0.0",
  "description": "Discord Japanese to English Auto Translation Bot"
}
```

### リリース管理
- `main` ブランチ: 安定版
- `develop` ブランチ: 開発版
- タグ付け: `v1.0.0`, `v2.0.0`

## 環境分離

### 開発環境
```
.env.development
DISCORD_TOKEN=dev_token
GOOGLE_API_KEY=dev_key
```

### 本番環境
```
.env.production
DISCORD_TOKEN=prod_token
GOOGLE_API_KEY=prod_key
```

## デプロイオプション

1. **Railway**: 自動デプロイ対応
2. **Fly.io**: 軽量、無料枠あり
3. **Render**: GitHub連携
4. **VPS**: 完全制御

## Discord Bot複数インスタンス
- JAEN (開発用)
- JAEN-PROD (本番用)
- 異なるサーバーで並行テスト可能
