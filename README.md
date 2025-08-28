# JAEN - Discord Japanese-English Auto Translation Bot

## Overview
JAEN (Japanese + English) is a Discord bot that automatically translates Japanese messages to English. When a user posts a message containing primarily Japanese text, JAEN responds with an automatic English translation.

## Features
- **Smart Language Detection**: Differentiates between Japanese text with English words vs. English grammatical structures
- **Real-time Translation**: Uses Google Cloud Translation API for high-quality translations
- **URL Summary**: Automatically extracts and summarizes webpage content (title, description, author) in both Japanese and English
- **Format Preservation**: Maintains line breaks and Discord markdown formatting in translations
- **Noise Filtering**: Ignores code blocks, images, and bot messages
- **Channel Restrictions**: Configurable per-channel operation
- **Debug Logging**: Comprehensive logging for monitoring and troubleshooting

## Version History
- **v2.1.0**: URL summary feature - extracts webpage metadata (title, description, author) and displays in Japanese & English
- **v2.0.1**: Format preservation - maintains line breaks and Discord markdown (bold, italic, etc.) in translations
- **v2.0.0**: Enhanced Japanese detection logic - allows English words within Japanese sentences
- **v1.0.0**: Initial release with strict Japanese-only detection

## Installation

### Prerequisites
- Node.js 18+
- Discord Bot Token
- Google Cloud Translation API Key

### Setup
```bash
git clone https://github.com/peaske/jaen.git
cd jaen
npm install
```

### Configuration
Copy the template environment file and add your credentials:
```bash
cp .env.template .env
```

Edit `.env` with your actual tokens:
```env
BOT_TOKEN_VALUE=your_discord_bot_token
TRANSLATE_API_KEY=your_google_translate_api_key
CHANNEL_FILTER_IDS=channel1,channel2 # Optional: restrict to specific channels
```

**⚠️ Security Note**: Never commit `.env` file to version control. Keep your tokens secure.

### Running
```bash
node index.js
```

## Usage Examples

**Japanese Translation (v2.0+):**
- "これはテストです" → "This is a test"
- "GitHub使ってAPI開発してます" → "I'm developing an API using GitHub"
- "ReactでUIコンポーネント作成中" → "Creating UI components with React"

**URL Summary (v2.1.0):**
- Post: "https://note.com/example/article"
- Response: Webpage summary with title, description, author in Japanese & English

**Will NOT be translated:**
- "I am developing an API" (English grammatical structure)
- Mixed bot responses

## Technical Stack
- Node.js + discord.js v14
- Google Cloud Translation API
- Environment-based configuration

## Development
- Main branch: Stable releases
- Develop branch: Active development
- Semantic versioning (x.y.z)

## License
MIT

---

# JAEN - Discord 日本語英語自動翻訳Bot

## 概要
JAEN（Japanese + English）は、日本語メッセージを自動で英語に翻訳するDiscord Botです。主に日本語で書かれたメッセージが投稿されると、JAENが自動で英語翻訳を返信します。

## 機能
- **スマート言語検出**: 日本語文中の英単語と英語文法構造を適切に区別
- **リアルタイム翻訳**: Google Cloud Translation APIによる高品質翻訳
- **ノイズフィルタリング**: URL、コードブロック、画像、Bot投稿を除外
- **チャンネル制限**: チャンネル別の動作設定が可能
- **デバッグログ**: 詳細なログによる監視とトラブルシューティング

## バージョン履歴
- **v2.1.0**: URL要約機能 - ウェブページのmeta情報（タイトル、概要、著者）を日英両言語で表示
- **v2.0.1**: フォーマット保持機能 - 翻訳時に改行とDiscordマークダウン（太字、斜体等）を保持
- **v2.0.0**: 日本語検出ロジック強化 - 日本語文中の英単語を許可
- **v1.0.0**: 厳密な日本語のみ検出での初回リリース

## インストール

### 前提条件
- Node.js 18+
- Discord Bot Token
- Google Cloud Translation API Key

### セットアップ
```bash
git clone https://github.com/peaske/jaen.git
cd jaen
npm install
```

### 設定
`.env`ファイルを作成:
```env
DISCORD_TOKEN=your_discord_bot_token
GOOGLE_API_KEY=your_google_translate_api_key
ALLOWED_CHANNEL_IDS=channel1,channel2 # オプション: 特定チャンネルに制限
```

### 実行
```bash
node index.js
```

## 使用例

**日本語翻訳 (v2.0+):**
- "これはテストです" → "This is a test"
- "GitHub使ってAPI開発してます" → "I'm developing an API using GitHub"
- "ReactでUIコンポーネント作成中" → "Creating UI components with React"

**URL要約 (v2.1.0):**
- 投稿: "https://note.com/example/article"
- 応答: タイトル、概要、著者を日英両言語で表示

**翻訳されない:**
- "I am developing an API" (英語文法構造)
- Bot同士の応答

## 技術スタック
- Node.js + discord.js v14
- Google Cloud Translation API
- 環境変数ベース設定

## 開発
- メインブランチ: 安定版リリース
- 開発ブランチ: アクティブ開発
- セマンティックバージョニング (x.y.z)

## ライセンス
MIT

---

# JAEN - Discord 日语英语自动翻译机器人

## 概述
JAEN（Japanese + English）是一个Discord机器人，可以自动将日语消息翻译成英语。当用户发布主要包含日语文本的消息时，JAEN会自动回复英语翻译。

## 功能
- **智能语言检测**: 区分日语文本中的英语单词与英语语法结构
- **实时翻译**: 使用Google Cloud Translation API进行高质量翻译
- **噪音过滤**: 忽略URL、代码块、图片和机器人消息
- **频道限制**: 可配置的按频道操作
- **调试日志**: 全面的日志记录用于监控和故障排除

## 版本历史
- **v2.1.0**: URL摘要功能 - 提取网页meta信息（标题、描述、作者）并以日英双语显示
- **v2.0.1**: 格式保持功能 - 翻译时保持换行和Discord标记（粗体、斜体等）
- **v2.0.0**: 增强的日语检测逻辑 - 允许日语句子中包含英语单词
- **v1.0.0**: 仅限严格日语检测的初始版本

## 安装

### 先决条件
- Node.js 18+
- Discord Bot Token
- Google Cloud Translation API Key

### 设置
```bash
git clone https://github.com/peaske/jaen.git
cd jaen
npm install
```

### 配置
创建`.env`文件:
```env
DISCORD_TOKEN=your_discord_bot_token
GOOGLE_API_KEY=your_google_translate_api_key
ALLOWED_CHANNEL_IDS=channel1,channel2 # 可选：限制到特定频道
```

### 运行
```bash
node index.js
```

## 使用示例

**将被翻译 (v2.0):**
- "これはテストです" → "This is a test"
- "GitHub使ってAPI開発してます" → "I'm developing an API using GitHub"
- "ReactでUIコンポーネント作成中" → "Creating UI components with React"

**不会被翻译:**
- "I am developing an API" (英语语法结构)
- "https://example.com" (仅URL)
- 机器人之间的响应

## 技术栈
- Node.js + discord.js v14
- Google Cloud Translation API
- 基于环境变量的配置

## 开发
- 主分支: 稳定版本
- 开发分支: 活跃开发
- 语义版本控制 (x.y.z)

## 许可证
MIT
