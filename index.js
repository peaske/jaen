// index.js (JAEN v2.0 - 日本語判定ロジック改良版)
require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const VERSION = '2.0.0';

console.log(`🚀 JAEN v${VERSION} 起動中...`);
console.log('Discord Token:', process.env.DISCORD_TOKEN ? '設定済み' : '未設定');
console.log('Google API Key:', process.env.GOOGLE_API_KEY ? '設定済み' : '未設定');

// Discord クライアント
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// チャンネル制限（.envで指定。空なら全チャンネル）
const allowed = (process.env.ALLOWED_CHANNEL_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const inScope = (channelId) => allowed.length === 0 || allowed.includes(channelId);

console.log('制限チャンネル:', allowed.length > 0 ? allowed : '全チャンネル対象');

// v2: 日本語主体判定（英単語混在OK、英語文法構造は除外）
function isJapaneseMain(text) {
  if (!text) return false;
  
  // 完全英語文パターン（主語+動詞構造）を除外
  const englishSentencePatterns = [
    /^[A-Z][a-z]+ (is|are|was|were|has|have|will|can|could|should|would)/,
    /^(I|You|He|She|It|We|They) [a-z]/,
    /^(This|That|These|Those) (is|are)/,
    /^(What|How|When|Where|Why|Who) [a-z]/,
    /^[A-Z][a-z]+ [a-z]+ [a-z]+ [a-z]+.*[.!?]$/
  ];
  
  if (englishSentencePatterns.some(pattern => pattern.test(text.trim()))) {
    return false;
  }
  
  // 日本語文字の比率計算
  const jpChars = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf\u31f0-\u31ff\uff66-\uff9f]/g) || []).length;
  const totalChars = text.replace(/\s+/g, '').length || 1;
  const jpRatio = jpChars / totalChars;
  
  // 日本語比率40%以上で翻訳対象（英単語混在許可）
  return jpRatio >= 0.4;
}

// ノイズ除外
function skip(msg) {
  if (msg.author.bot) return true;
  const c = (msg.content || '').trim();
  if (!c && msg.attachments.size > 0) return true;
  if (/^https?:\/\//i.test(c)) return true;
  if (/```[\s\S]*```/m.test(c)) return true;
  return false;
}

// Google Translation API呼び出し
async function translateToEnglish(text) {
  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: 'en',
        source: 'ja'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('🚨 翻訳エラー:', error.message);
    throw error;
  }
}

// Discord イベントハンドラー
client.once(Events.ClientReady, () => {
  console.log(`✅ JAEN v${VERSION} ready as ${client.user.tag}`);
  console.log(`📊 サーバー数: ${client.guilds.cache.size}`);
  console.log('🎯 翻訳機能が有効になりました（v2: 英単語混在対応）');
});

client.on(Events.MessageCreate, async (msg) => {
  try {
    // デバッグログ
    const shouldSkip = skip(msg);
    const isInScope = inScope(msg.channelId);
    const isJapMain = isJapaneseMain(msg.content);
    
    console.log(`📝 メッセージ受信: "${msg.content}"`);
    console.log(`  - スキップ判定: ${shouldSkip}`);
    console.log(`  - チャンネル対象: ${isInScope}`);
    console.log(`  - 日本語主体: ${isJapMain}`);
    
    if (shouldSkip) {
      console.log('⏭️  スキップ理由: Bot投稿/画像のみ/URL/コードブロック');
      return;
    }
    
    if (!isInScope) {
      console.log('⏭️  スキップ理由: 対象外チャンネル');
      return;
    }
    
    if (!isJapMain) {
      console.log('⏭️  スキップ理由: 日本語主体ではない（英語文法構造）');
      return;
    }

    console.log('🔄 翻訳開始...');
    const translated = await translateToEnglish(msg.content);
    console.log(`✅ 翻訳完了: "${translated}"`);
    
    await msg.reply(`**英訳 (Auto v${VERSION}):**\n${translated}`);
    console.log('📤 返信送信完了');
    
  } catch (err) {
    console.error('❌ エラー発生:', err);
  }
});

// エラーハンドリング
client.on('error', error => {
  console.error('🚨 Discord クライアントエラー:', error);
});

client.on('warn', warning => {
  console.warn('⚠️  警告:', warning);
});

// ログイン
console.log('🔐 Discordにログイン中...');
client.login(process.env.DISCORD_TOKEN)
  .catch(error => {
    console.error('❌ ログイン失敗:', error);
    process.exit(1);
  });
