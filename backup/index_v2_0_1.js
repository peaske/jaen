// index.js (JAEN v2.0 - 日本語判定ロジック改良版)
require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const cheerio = require('cheerio');

const VERSION = '2.1.0';

console.log(`🚀 JAEN v${VERSION} 起動中...`);
console.log('Discord Token:', process.env.BOT_TOKEN_VALUE ? '設定済み' : '未設定');
console.log('Google API Key:', process.env.TRANSLATE_API_KEY ? '設定済み' : '未設定');

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

// ノイズ除外 (v2.1.0: URL除外を削除)
function skip(msg) {
  if (msg.author.bot) return true;
  const c = (msg.content || '').trim();
  if (!c && msg.attachments.size > 0) return true;
  if (/```[\s\S]*```/m.test(c)) return true;
  return false;
}

// v2.1.0: URL要約機能
async function extractPageMetadata(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JAEN-Bot/2.1.0)'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // metaタグ情報を抽出
    const metadata = {
      title: $('title').text()?.trim() || 
             $('meta[property="og:title"]').attr('content')?.trim(),
      description: $('meta[name="description"]').attr('content')?.trim() ||
                  $('meta[property="og:description"]').attr('content')?.trim(),
      author: $('meta[name="author"]').attr('content')?.trim() ||
              $('meta[property="article:author"]').attr('content')?.trim(),
      keywords: $('meta[name="keywords"]').attr('content')?.trim(),
      siteName: $('meta[property="og:site_name"]').attr('content')?.trim()
    };
    
    return metadata;
  } catch (error) {
    console.error('🚨 メタデータ取得エラー:', error.message);
    throw error;
  }
}

// URL要約フォーマット生成
async function createUrlSummary(metadata) {
  try {
    // 日本語フォーマット
    let jpSummary = '📌 ページ要約\n\n🇯🇵 日本語:\n';
    if (metadata.title) jpSummary += `📄 タイトル: ${metadata.title}\n`;
    if (metadata.description) jpSummary += `📝 概要: ${metadata.description}\n`;
    if (metadata.author) jpSummary += `👤 著者: ${metadata.author}\n`;
    if (metadata.keywords) jpSummary += `🏷️ キーワード: ${metadata.keywords}\n`;
    
    // 英語翻訳
    const enTitle = metadata.title ? await translateToEnglish(metadata.title) : null;
    const enDescription = metadata.description ? await translateToEnglish(metadata.description) : null;
    const enAuthor = metadata.author ? await translateToEnglish(metadata.author) : null;
    const enKeywords = metadata.keywords ? await translateToEnglish(metadata.keywords) : null;
    
    // 英語フォーマット
    let enSummary = '\n🇺🇸 English:\n';
    if (enTitle) enSummary += `📄 Title: ${enTitle}\n`;
    if (enDescription) enSummary += `📝 Overview: ${enDescription}\n`;
    if (enAuthor) enSummary += `👤 Author: ${enAuthor}\n`;
    if (enKeywords) enSummary += `🏷️ Keywords: ${enKeywords}\n`;
    
    return jpSummary + enSummary;
  } catch (error) {
    console.error('🚨 要約生成エラー:', error.message);
    throw error;
  }
}

// URL判定関数
function isUrl(text) {
  return /^https?:\/\/[^\s]+$/i.test(text.trim());
}

// v2.0.1: マークダウン・改行保持翻訳機能
function parseMarkdownStructure(text) {
  const parts = [];
  let currentIndex = 0;
  
  // マークダウンパターンを保持（太字、斜体、コードなど）
  const markdownPatterns = [
    { regex: /\*\*(.+?)\*\*/g, type: 'bold' },
    { regex: /\*(.+?)\*/g, type: 'italic' },
    { regex: /`(.+?)`/g, type: 'code' },
    { regex: /~~(.+?)~~/g, type: 'strikethrough' },
    { regex: /__(.+?)__/g, type: 'underline' }
  ];
  
  const allMatches = [];
  
  for (const pattern of markdownPatterns) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        full: match[0],
        content: match[1],
        type: pattern.type
      });
    }
  }
  
  // 位置順にソート
  allMatches.sort((a, b) => a.start - b.start);
  
  for (const match of allMatches) {
    // マークダウン前のテキスト
    if (match.start > currentIndex) {
      parts.push({
        type: 'text',
        content: text.slice(currentIndex, match.start)
      });
    }
    
    // マークダウン部分
    parts.push({
      type: match.type,
      content: match.content,
      wrapper: match.full
    });
    
    currentIndex = match.end;
  }
  
  // 残りのテキスト
  if (currentIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(currentIndex)
    });
  }
  
  return parts;
}

// 改行とマークダウンを保持した翻訳
async function translateWithFormatting(originalText) {
  try {
    // 改行で分割
    const lines = originalText.split('\n');
    const translatedLines = [];
    
    for (const line of lines) {
      if (!line.trim()) {
        translatedLines.push(''); // 空行を保持
        continue;
      }
      
      const parts = parseMarkdownStructure(line);
      const translatedParts = [];
      
      for (const part of parts) {
        if (part.type === 'text' && part.content.trim()) {
          // テキスト部分のみ翻訳
          const translated = await translateToEnglish(part.content);
          translatedParts.push(translated);
        } else if (part.type !== 'text') {
          // マークダウン部分は内容を翻訳してフォーマット復元
          const translatedContent = await translateToEnglish(part.content);
          const wrapper = getMarkdownWrapper(part.type);
          translatedParts.push(`${wrapper}${translatedContent}${wrapper}`);
        }
      }
      
      translatedLines.push(translatedParts.join(''));
    }
    
    return translatedLines.join('\n');
  } catch (error) {
    console.error('🚨 フォーマット保持翻訳エラー:', error.message);
    // フォールバック: 通常翻訳
    return await translateToEnglish(originalText);
  }
}

// マークダウンラッパー取得
function getMarkdownWrapper(type) {
  const wrappers = {
    bold: '**',
    italic: '*',
    code: '`',
    strikethrough: '~~',
    underline: '__'
  };
  return wrappers[type] || '';
}

// 基本翻訳API呼び出し
async function translateToEnglish(text) {
  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.TRANSLATE_API_KEY}`, {
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

    console.log('🔄 翻訳開始（改行・スタイル保持）...');
    const translated = await translateWithFormatting(msg.content);
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
client.login(process.env.BOT_TOKEN_VALUE)
  .catch(error => {
    console.error('❌ ログイン失敗:', error);
    process.exit(1);
  });
