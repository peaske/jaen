// test/google-debug.js - 詳細なGoogle Translation APIデバッグ
require('dotenv').config();

async function detailedGoogleTest() {
  console.log('=== Google Translation API 詳細デバッグ ===');
  console.log('APIキー:', process.env.GOOGLE_API_KEY ? '設定済み' : '未設定');
  console.log('APIキー長:', process.env.GOOGLE_API_KEY?.length);
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEYが.envに設定されていません');
    return;
  }
  
  try {
    console.log('\n🧪 REST API直接呼び出しテスト...');
    
    // REST APIを直接呼び出し
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'こんにちは',
        target: 'en',
        source: 'ja'
      })
    });
    
    console.log('HTTPステータス:', response.status);
    console.log('HTTPステータステキスト:', response.statusText);
    
    const result = await response.text();
    console.log('レスポンス:', result);
    
    if (response.ok) {
      const data = JSON.parse(result);
      console.log('✅ 翻訳成功:', data.data.translations[0].translatedText);
    } else {
      console.error('❌ APIエラー詳細:', result);
      
      // エラー詳細分析
      try {
        const errorData = JSON.parse(result);
        console.log('\nエラー分析:');
        console.log('- コード:', errorData.error?.code);
        console.log('- メッセージ:', errorData.error?.message);
        console.log('- ステータス:', errorData.error?.status);
        
        if (errorData.error?.code === 403) {
          console.log('\n💡 403エラー解決方法:');
          console.log('1. 課金アカウントが設定されているか確認');
          console.log('2. APIキーに正しい制限が設定されているか確認');
          console.log('3. Cloud Translation APIが有効化されているか確認');
          console.log('4. プロジェクトが正しく選択されているか確認');
        }
      } catch (e) {
        console.log('エラー詳細の解析に失敗');
      }
    }
    
  } catch (error) {
    console.error('❌ ネットワークエラー:', error.message);
  }
}

detailedGoogleTest();
