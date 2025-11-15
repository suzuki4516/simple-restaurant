# 🤖 自動満席判定 - Google Apps Script セットアップガイド

Google Apps Script (GAS) を使って、予約数を自動で取得し、満席日を自動判定する機能を実装します。

---

## 📊 仕組み

```
予約システム → Google Apps Script API → スプレッドシート
                        ↓
                  予約数をカウント
                        ↓
              満席日の配列を返す
```

---

## ステップ1: Google Apps Script を開く

### 1-1. スプレッドシートを開く

予約データが保存されているGoogleスプレッドシートを開きます。

### 1-2. Apps Script エディタを開く

1. メニューバーの **「拡張機能」** → **「Apps Script」** をクリック
2. 新しいタブでApps Scriptエディタが開きます

---

## ステップ2: コードを貼り付け

### 2-1. 既存のコードを削除

エディタに表示されている既存のコード（`function myFunction() { ... }`）を **すべて削除** します。

### 2-2. 以下のコードを貼り付け

```javascript
/**
 * 予約管理API
 * 各日付の予約数を取得して、満席日を判定する
 */

// ===== 設定 =====
const CONFIG = {
  // 1日あたりの予約上限数
  MAX_RESERVATIONS_PER_DAY: 10,  // ← ここを変更：1日の最大予約数

  // スプレッドシートのシート名
  SHEET_NAME: 'フォームの回答 1',  // ← 必要に応じて変更

  // 日付列（A列 = 1, B列 = 2, ...）
  DATE_COLUMN: 2  // B列（タイムスタンプの次の列）
};

/**
 * Web APIのエンドポイント
 * GET リクエストで呼び出される
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getFullyBookedDates') {
      // 満席日のリストを取得
      const fullyBookedDates = getFullyBookedDates();

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: fullyBookedDates,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);

    } else {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 満席日のリストを取得
 */
function getFullyBookedDates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    throw new Error(`シート "${CONFIG.SHEET_NAME}" が見つかりません`);
  }

  const data = sheet.getDataRange().getValues();

  // ヘッダー行をスキップ
  const rows = data.slice(1);

  // 日付ごとの予約数をカウント
  const reservationCounts = {};

  rows.forEach(row => {
    const dateCell = row[CONFIG.DATE_COLUMN - 1];

    if (dateCell) {
      // 日付を YYYY-MM-DD 形式に変換
      const dateStr = extractDate(dateCell);

      if (dateStr) {
        reservationCounts[dateStr] = (reservationCounts[dateStr] || 0) + 1;
      }
    }
  });

  // 満席日をフィルタリング
  const fullyBookedDates = Object.keys(reservationCounts).filter(date => {
    return reservationCounts[date] >= CONFIG.MAX_RESERVATIONS_PER_DAY;
  });

  return fullyBookedDates.sort();
}

/**
 * 日付文字列から YYYY-MM-DD 形式を抽出
 */
function extractDate(dateValue) {
  try {
    let dateStr;

    // 文字列の場合（例: "2025年11月20日（水）"）
    if (typeof dateValue === 'string') {
      const match = dateValue.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
    }
    // Date オブジェクトの場合
    else if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    return dateStr;
  } catch (error) {
    Logger.log('日付の抽出エラー: ' + error);
    return null;
  }
}

/**
 * テスト用関数
 * Apps Script エディタで実行して動作確認できる
 */
function testGetFullyBookedDates() {
  const result = getFullyBookedDates();
  Logger.log('満席日: ' + JSON.stringify(result));
  return result;
}
```

### 2-3. 設定を変更

コードの上部（6-14行目）にある設定を確認・変更します：

```javascript
const CONFIG = {
  // 1日あたりの予約上限数
  MAX_RESERVATIONS_PER_DAY: 10,  // ← ここを変更：1日の最大予約数

  // スプレッドシートのシート名
  SHEET_NAME: 'フォームの回答 1',  // ← 必要に応じて変更

  // 日付列（A列 = 1, B列 = 2, ...）
  DATE_COLUMN: 2  // B列（タイムスタンプの次の列）
};
```

**重要：**
- **`MAX_RESERVATIONS_PER_DAY`**: 1日の最大予約数（例：10件で満席）
- **`SHEET_NAME`**: スプレッドシートのシート名（通常は「フォームの回答 1」）
- **`DATE_COLUMN`**: 予約日時が入力されている列番号（A=1, B=2, C=3...）

---

## ステップ3: デプロイ（公開）

### 3-1. 保存

1. **Ctrl+S** または **ファイル → 保存** でコードを保存
2. プロジェクト名を聞かれたら「予約管理API」と入力

### 3-2. デプロイ

1. 右上の **「デプロイ」** ボタンをクリック
2. **「新しいデプロイ」** を選択

### 3-3. デプロイ設定

1. **「種類の選択」** の横の歯車アイコン ⚙️ をクリック
2. **「ウェブアプリ」** を選択

3. 以下の設定を行います：
   - **説明**: 「予約管理API v1」（任意）
   - **次のユーザーとして実行**: **「自分」** を選択
   - **アクセスできるユーザー**: **「全員」** を選択

4. **「デプロイ」** ボタンをクリック

### 3-4. 承認

初回デプロイ時に承認が必要です：

1. **「アクセスを承認」** をクリック
2. Googleアカウントを選択
3. **「詳細」** → **「予約管理API（安全ではないページ）に移動」** をクリック
4. **「許可」** をクリック

### 3-5. URLをコピー

デプロイが完了すると、**「ウェブアプリのURL」** が表示されます。

```
https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
```

このURLを **コピー** してください。このURLが API のエンドポイントになります。

---

## ステップ4: テスト

### 4-1. ブラウザでテスト

コピーしたURLの末尾に `?action=getFullyBookedDates` を追加してブラウザで開きます：

```
https://script.google.com/macros/s/XXXXXXXXX/exec?action=getFullyBookedDates
```

### 4-2. 結果確認

以下のようなJSON形式の結果が表示されればOKです：

```json
{
  "success": true,
  "data": [
    "2025-11-20",
    "2025-12-24"
  ],
  "timestamp": "2025-11-15T12:00:00.000Z"
}
```

**`data`** 配列に満席日が表示されます。予約がまだ少ない場合は空配列 `[]` になります。

---

## ステップ5: reservation.js に API URL を設定

### 5-1. reservation.js を開く

[reservation.js](js/reservation.js) をテキストエディタで開きます。

### 5-2. API URL を設定

ファイルの上部（39-50行目あたり）に以下のコードを追加します：

```javascript
// ===== Google Apps Script API設定 =====
const GAS_API_URL = 'https://script.google.com/macros/s/XXXXXXXXX/exec';  // ← デプロイしたURLを貼り付け
const ENABLE_AUTO_FULLY_BOOKED = true;  // true: 自動判定ON, false: 手動設定のみ
```

**`XXXXXXXXX`** の部分を、ステップ3-5でコピーしたURLに置き換えてください。

---

## ステップ6: 動作確認

### 6-1. 予約ページを開く

ブラウザで [reservation.html](reservation.html) を開きます。

### 6-2. カレンダーを確認

カレンダーが表示されたら、F12 を押して **Console** タブを開きます。

以下のようなログが表示されれば成功です：

```
満席日を取得しました: ["2025-11-20", "2025-12-24"]
```

### 6-3. 満席日の表示確認

満席日がカレンダーでピンク色＋「満席」バッジで表示されることを確認してください。

---

## 🔧 設定のカスタマイズ

### 1日の予約上限数を変更

Apps Script のコード（6行目）を変更：

```javascript
MAX_RESERVATIONS_PER_DAY: 10,  // ← この数値を変更
```

変更後は：
1. **Ctrl+S** で保存
2. **「デプロイ」** → **「デプロイを管理」** → **「編集」** → **「バージョン: 新バージョン」** → **「デプロイ」**

### キャッシュ時間の設定

満席日のデータをキャッシュして、API呼び出しを減らすことができます（後述）。

---

## ⚠️ トラブルシューティング

### Q1: "success": false と表示される

**原因:**
- シート名が間違っている
- 日付列の番号が間違っている

**確認方法:**
1. スプレッドシートを開く
2. シート名を確認（通常は「フォームの回答 1」）
3. 予約日時がどの列にあるか確認（A=1, B=2, C=3...）
4. Apps Script のコードを修正して再デプロイ

### Q2: CORS エラーが出る

**原因:**
デプロイ時に「アクセスできるユーザー」を「全員」に設定していない

**解決方法:**
1. Apps Script エディタで **「デプロイ」** → **「デプロイを管理」**
2. 現在のデプロイの **「編集」** をクリック
3. **「アクセスできるユーザー」** を **「全員」** に変更
4. **「デプロイ」** をクリック

### Q3: 満席日が正しく表示されない

**確認方法:**
1. ブラウザで API URL を直接開いて、結果を確認
2. F12 → Console でエラーがないか確認
3. スプレッドシートの日付形式を確認

---

## 📝 次のステップ

これで自動満席判定の設定は完了です！

次に、以下の機能を実装します：

1. **キャッシュ機能**（API呼び出しを減らす）
2. **ローディング表示**（データ取得中の表示）
3. **エラーハンドリング**（API接続失敗時の対処）

これらは次のステップで実装しますので、まずは上記の手順でAPIが動作することを確認してください。

---

**設定が完了したら、デプロイしたURLを教えてください！**
