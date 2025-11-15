# 🚀 超簡単！entry ID自動取得スクリプト

手動でentry IDを探すのが面倒な方向けに、**自動でentry IDを取得するスクリプト**を用意しました。

---

## 使い方（3ステップで完了！）

### ステップ1: フォームのプレビューを開く

1. Googleフォーム編集画面を開く
   ```
   https://docs.google.com/forms/d/1cAvRmsZqw0zffZZOAe7OU1-STeaaDTqiwDjE0WYq9R4/edit
   ```

2. 右上の **👁（目のアイコン）** をクリックしてプレビューを開く

### ステップ2: コンソールを開く

プレビュー画面で以下のキーを押します：
- Windows: `F12`
- Mac: `Command + Option + I`

開発者ツールが開いたら、「**Console**」タブをクリック

### ステップ3: スクリプトを実行

以下のコードを **すべてコピー** して、コンソールに **貼り付けて Enter**：

```javascript
// entry ID自動取得スクリプト
(function() {
    console.clear();
    console.log('='.repeat(60));
    console.log('📋 Googleフォーム entry ID 自動取得ツール');
    console.log('='.repeat(60));
    console.log('');

    // すべてのinputとtextareaを取得
    const inputs = document.querySelectorAll('input[name^="entry."], textarea[name^="entry."]');

    if (inputs.length === 0) {
        console.error('❌ entry IDが見つかりませんでした。');
        console.log('');
        console.log('確認事項:');
        console.log('1. フォームのプレビュー画面で実行していますか？');
        console.log('2. フォームに質問が追加されていますか？');
        return;
    }

    console.log(`✅ ${inputs.length}個のentry IDが見つかりました！\n`);

    // entry IDリストを作成
    const entries = [];
    inputs.forEach((input, index) => {
        const entryId = input.getAttribute('name');
        const label = input.closest('.Qr7Oae')?.querySelector('.M7eMe')?.textContent || `質問${index + 1}`;
        entries.push({ label, entryId });
        console.log(`${index + 1}. ${label}`);
        console.log(`   → ${entryId}`);
        console.log('');
    });

    // コード用の設定を生成
    console.log('='.repeat(60));
    console.log('📝 以下をコピーして reservation.js に貼り付けてください:');
    console.log('='.repeat(60));
    console.log('');

    const formId = '1cAvRmsZqw0zffZZOAe7OU1-STeaaDTqiwDjE0WYq9R4';

    const config = `const GOOGLE_FORM_CONFIG = {
    formId: '${formId}',
    entries: {
        date: '${entries[0]?.entryId || 'entry.000000001'}',        // ${entries[0]?.label || '予約日時'}
        time: '${entries[1]?.entryId || 'entry.000000002'}',        // ${entries[1]?.label || '予約時間'}
        guests: '${entries[2]?.entryId || 'entry.000000003'}',      // ${entries[2]?.label || '人数'}
        course: '${entries[3]?.entryId || 'entry.000000004'}',      // ${entries[3]?.label || 'コース'}
        name: '${entries[4]?.entryId || 'entry.000000005'}',        // ${entries[4]?.label || 'お名前'}
        nameKana: '${entries[5]?.entryId || 'entry.000000006'}',    // ${entries[5]?.label || 'フリガナ'}
        email: '${entries[6]?.entryId || 'entry.000000007'}',       // ${entries[6]?.label || 'メールアドレス'}
        phone: '${entries[7]?.entryId || 'entry.000000008'}',       // ${entries[7]?.label || '電話番号'}
        requests: '${entries[8]?.entryId || 'entry.000000009'}'     // ${entries[8]?.label || 'ご要望・アレルギー'}
    }
};`;

    console.log(config);
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ 完了！上記のコードをコピーしてください');
    console.log('='.repeat(60));

    // クリップボードにコピー（可能な場合）
    if (navigator.clipboard) {
        navigator.clipboard.writeText(config).then(() => {
            console.log('');
            console.log('📋 クリップボードにコピーしました！');
            console.log('   reservation.js の該当部分に貼り付けてください。');
        }).catch(() => {
            console.log('');
            console.log('⚠️  自動コピーできませんでした。手動でコピーしてください。');
        });
    }
})();
```

---

## 実行結果の例

スクリプトを実行すると、以下のような結果が表示されます：

```
============================================================
📋 Googleフォーム entry ID 自動取得ツール
============================================================

✅ 9個のentry IDが見つかりました！

1. 予約日時
   → entry.123456789

2. 予約時間
   → entry.234567890

3. 人数
   → entry.345678901

...

============================================================
📝 以下をコピーして reservation.js に貼り付けてください:
============================================================

const GOOGLE_FORM_CONFIG = {
    formId: '1cAvRmsZqw0zffZZOAe7OU1-STeaaDTqiwDjE0WYq9R4',
    entries: {
        date: 'entry.123456789',        // 予約日時
        time: 'entry.234567890',        // 予約時間
        guests: 'entry.345678901',      // 人数
        course: 'entry.456789012',      // コース
        name: 'entry.567890123',        // お名前
        nameKana: 'entry.678901234',    // フリガナ
        email: 'entry.789012345',       // メールアドレス
        phone: 'entry.890123456',       // 電話番号
        requests: 'entry.901234567'     // ご要望・アレルギー
    }
};

============================================================
✅ 完了！上記のコードをコピーしてください
============================================================

📋 クリップボードにコピーしました！
   reservation.js の該当部分に貼り付けてください。
```

---

## 次にすること

1. **コンソールに表示されたコードをコピー**
   - 自動でクリップボードにコピーされます
   - されない場合は、手動で選択してコピー（Ctrl+C）

2. **reservation.jsを開く**
   ```
   simple-restaurant/js/reservation.js
   ```

3. **該当部分を置き換え**
   - ファイルの最初の方にある `const GOOGLE_FORM_CONFIG = { ... }` を
   - コピーしたコードで置き換える

4. **保存**
   - Ctrl+S で保存

---

## ⚠️ トラブルシューティング

### 「entry IDが見つかりませんでした」と表示される

**原因と対処法:**

1. **フォームのプレビュー画面で実行していない**
   - 編集画面ではなく、プレビュー画面（👁アイコン）で実行してください

2. **フォームに質問が追加されていない**
   - まずフォームに9つの質問を追加してください
   - SETUP_GUIDE_VISUAL.md を参照

3. **ページが完全に読み込まれていない**
   - ページを再読み込み（F5）してから、もう一度実行

### コンソールにエラーが表示される

**よくあるエラー:**

```
Uncaught SyntaxError: ...
```
↑ コードが正しくコピーされていません。もう一度コピー＆貼り付けしてください。

```
Cannot read property 'textContent' of null
```
↑ フォームの構造が想定と異なります。手動でentry IDを取得してください（SETUP_GUIDE_VISUAL.md参照）

---

## 💡 さらに便利な使い方

### ブックマークレットとして登録

このスクリプトをブックマークに登録すると、ワンクリックで実行できます！

1. ブラウザのブックマークバーを右クリック → 「新しいブックマークを追加」
2. 名前: `entry ID取得`
3. URL: 以下のコードを貼り付け

```javascript
javascript:(function(){console.clear();console.log('='.repeat(60));console.log('%c📋 Googleフォーム entry ID 自動取得ツール','font-size:16px;font-weight:bold');console.log('='.repeat(60));console.log('');const inputs=document.querySelectorAll('input[name^="entry."], textarea[name^="entry."]');if(inputs.length===0){console.error('❌ entry IDが見つかりませんでした。');return;}console.log(`✅ ${inputs.length}個のentry IDが見つかりました!\n`);const entries=[];inputs.forEach((input,index)=>{const entryId=input.getAttribute('name');const label=input.closest('.Qr7Oae')?.querySelector('.M7eMe')?.textContent||`質問${index+1}`;entries.push({label,entryId});console.log(`${index+1}. ${label}`);console.log(`   → ${entryId}`);console.log('');});console.log('='.repeat(60));const formId='1cAvRmsZqw0zffZZOAe7OU1-STeaaDTqiwDjE0WYq9R4';const config=`const GOOGLE_FORM_CONFIG = {\n    formId: '${formId}',\n    entries: {\n        date: '${entries[0]?.entryId}',\n        time: '${entries[1]?.entryId}',\n        guests: '${entries[2]?.entryId}',\n        course: '${entries[3]?.entryId}',\n        name: '${entries[4]?.entryId}',\n        nameKana: '${entries[5]?.entryId}',\n        email: '${entries[6]?.entryId}',\n        phone: '${entries[7]?.entryId}',\n        requests: '${entries[8]?.entryId}'\n    }\n};`;console.log(config);if(navigator.clipboard){navigator.clipboard.writeText(config).then(()=>{console.log('\n📋 クリップボードにコピーしました!');});}})();
```

4. 保存

次回からは、フォームのプレビュー画面でこのブックマークをクリックするだけで実行できます！

---

**これで作業時間が大幅に短縮されます！**
