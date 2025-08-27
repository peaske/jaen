// test/api-test.js - Google Translation API接続テスト
require('dotenv').config({ path: '../.env' });
const { v2 } = require('@google-cloud/translate');

async function testGoogleTranslateAPI() {
  console.log('🧪 Google Translation API接続テスト開始...');
  
  try {
    const translate = new v2.Translate({ key: process.env.GOOGLE_API_KEY });
    
    // テスト用の簡単な翻訳
    const testText = 'こんにちは、世界！';
    const [translation] = await translate.translate(testText, 'en');
    
    console.log('✅ API接続成功！');
    console.log(`原文: ${testText}`);
    console.log(`翻訳: ${translation}`);
    
    return true;
  } catch (error) {
    console.error('❌ API接続エラー:');
    console.error('エラーメッセージ:', error.message);
    console.error('エラーコード:', error.code);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 解決方法:');
      console.log('1. Google Cloud ConsoleでAPIキーが正しく設定されているか確認');
      console.log('2. Cloud Translation APIが有効化されているか確認');
      console.log('3. APIキーにTranslation APIの使用権限が付与されているか確認');
    }
    
    return false;
  }
}

testGoogleTranslateAPI();
