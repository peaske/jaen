// DeepL APIテスト
require('dotenv').config();

async function testDeepLAPI() {
  console.log('DeepL API接続テスト開始...');
  
  try {
    // DeepL API Free: 月50万文字まで無料
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'text': 'こんにちは、世界！',
        'target_lang': 'EN',
        'source_lang': 'JA'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ DeepL API接続成功！');
    console.log(`翻訳結果: ${data.translations[0].text}`);
    
  } catch (error) {
    console.error('❌ DeepL API エラー:', error.message);
    console.log('\n💡 DeepL API設定方法:');
    console.log('1. https://www.deepl.com/pro/change-plan でFreeプランに登録');
    console.log('2. APIキーを取得（末尾:fxの形式）');
    console.log('3. .envにDEEPL_API_KEY=your_key_here:fx を追加');
  }
}

testDeepLAPI();
