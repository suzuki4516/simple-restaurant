// 予約システム JavaScript

// ===== Googleフォーム設定 =====
// GOOGLE_FORM_SETUP.md を参照して以下を設定してください
const GOOGLE_FORM_CONFIG = {
    // Googleフォームを作成後、ここにフォームIDを設定
    formId: '1cAvRmsZqw0zffZZOAe7OU1-STeaaDTqiwDjE0WYq9R4',  // 例: '1FAIpQLSc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

    // 各質問のentry IDを設定（GOOGLE_FORM_SETUP.mdの手順3参照）
    entries: {
        date: 'entry.1854835807',        // 予約日時のentry ID
        time: 'entry.508842742',        // 予約時間のentry ID
        guests: 'entry.1436268677',      // 人数のentry ID
        course: 'entry.465794597',      // コースのentry ID
        name: 'entry.1387828492',        // お名前のentry ID
        nameKana: 'entry.669712672',    // フリガナのentry ID
        email: 'entry.358414579',       // メールアドレスのentry ID
        phone: 'entry.1791113540',       // 電話番号のentry ID
        requests: 'entry.578940633'     // ご要望のentry ID
    }
};
// ===== 設定ここまで =====

// グローバル変数
let currentDate = new Date();
let selectedDate = null;
let reservationData = {
    date: null,
    time: null,
    guests: null,
    course: null,
    name: null,
    nameKana: null,
    email: null,
    phone: null,
    requests: null
};

// 予約不可日（定休日: 水曜日）
const closedDays = [3]; // 0=日曜, 1=月曜, ..., 6=土曜

// 営業時間設定
const businessHours = {
    lunch: {
        start: '11:30',
        end: '14:30',
        slots: ['11:30', '12:00', '12:30', '13:00', '13:30', '14:00']
    },
    dinner: {
        start: '17:30',
        end: '22:00',
        slots: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
    initEventListeners();
});

// カレンダー初期化
function initCalendar() {
    renderCalendar();
}

// カレンダー描画
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 月表示更新
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    document.getElementById('currentMonth').textContent = `${year}年 ${monthNames[month]}`;

    // カレンダーグリッド作成
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let calendarHTML = '<div class="calendar-grid">';

    // 曜日ヘッダー
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-name">${day}</div>`;
    });

    // 空白セル（月初まで）
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-date empty"></div>';
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const isPast = date < today;
        const isClosed = closedDays.includes(dayOfWeek);
        const isSelected = selectedDate &&
                          selectedDate.getDate() === day &&
                          selectedDate.getMonth() === month &&
                          selectedDate.getFullYear() === year;

        let classes = 'calendar-date';
        if (isPast) classes += ' past';
        else if (isClosed) classes += ' closed';
        else classes += ' available';
        if (isSelected) classes += ' selected';
        if (dayOfWeek === 0) classes += ' sunday';
        if (dayOfWeek === 6) classes += ' saturday';

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        calendarHTML += `<div class="${classes}" data-date="${dateStr}" data-available="${!isPast && !isClosed}">${day}</div>`;
    }

    calendarHTML += '</div>';
    document.getElementById('calendar').innerHTML = calendarHTML;

    // 日付クリックイベント
    document.querySelectorAll('.calendar-date.available').forEach(dateEl => {
        dateEl.addEventListener('click', function() {
            selectDate(this.dataset.date);
        });
    });
}

// 日付選択
function selectDate(dateStr) {
    selectedDate = new Date(dateStr + 'T00:00:00');
    reservationData.date = dateStr;

    // カレンダー再描画
    renderCalendar();

    // 時間帯選択を有効化
    updateTimeSlots();

    // 選択情報を更新
    updateSelectedInfo();
}

// 時間帯選択更新
function updateTimeSlots() {
    const timeSlotSelect = document.getElementById('timeSlot');
    timeSlotSelect.innerHTML = '<option value="">選択してください</option>';

    // ランチとディナーの時間帯を追加
    const lunchGroup = document.createElement('optgroup');
    lunchGroup.label = 'ランチ (11:30-14:30)';
    businessHours.lunch.slots.forEach(time => {
        const option = document.createElement('option');
        option.value = `lunch-${time}`;
        option.textContent = time;
        lunchGroup.appendChild(option);
    });
    timeSlotSelect.appendChild(lunchGroup);

    const dinnerGroup = document.createElement('optgroup');
    dinnerGroup.label = 'ディナー (17:30-22:00)';
    businessHours.dinner.slots.forEach(time => {
        const option = document.createElement('option');
        option.value = `dinner-${time}`;
        option.textContent = time;
        dinnerGroup.appendChild(option);
    });
    timeSlotSelect.appendChild(dinnerGroup);

    timeSlotSelect.disabled = false;
}

// コース選択を時間帯に応じて更新
function updateCourseOptions(timeType) {
    const courseSelect = document.getElementById('courseType');
    courseSelect.innerHTML = '<option value="">選択してください</option>';

    if (timeType === 'lunch') {
        // ランチメニューのみ表示
        const lunchGroup = document.createElement('optgroup');
        lunchGroup.label = 'ランチ（11:30-14:30）';

        const lunchCourses = [
            { value: 'lunch-daily', text: '日替わりランチ（¥1,200）' },
            { value: 'lunch-pasta', text: 'パスタランチ（¥1,500）' },
            { value: 'lunch-grill', text: 'グリルランチ（¥1,800）' },
            { value: 'lunch-course', text: '特選ランチコース（¥2,800）' }
        ];

        lunchCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.value;
            option.textContent = course.text;
            lunchGroup.appendChild(option);
        });

        courseSelect.appendChild(lunchGroup);

    } else if (timeType === 'dinner') {
        // ディナーメニューのみ表示
        const dinnerGroup = document.createElement('optgroup');
        dinnerGroup.label = 'ディナー（17:30-22:00）';

        const dinnerCourses = [
            { value: 'dinner-chef', text: 'シェフおまかせコース（¥6,500）' },
            { value: 'dinner-premium', text: 'プレミアムコース（¥9,800）' },
            { value: 'dinner-alacarte', text: 'アラカルト' }
        ];

        dinnerCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.value;
            option.textContent = course.text;
            dinnerGroup.appendChild(option);
        });

        courseSelect.appendChild(dinnerGroup);
    }

    // 現在のコース選択をリセット
    reservationData.course = null;
    courseSelect.disabled = false;
}

// 選択情報表示更新
function updateSelectedInfo() {
    const hasDateTime = reservationData.date && reservationData.time;
    const hasGuests = reservationData.guests;
    const hasCourse = reservationData.course;

    if (hasDateTime || hasGuests || hasCourse) {
        document.getElementById('selectedInfo').style.display = 'block';

        if (hasDateTime) {
            const date = new Date(reservationData.date);
            const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${reservationData.time}`;
            document.getElementById('selectedDateTime').textContent = dateStr;
        }

        if (hasGuests) {
            document.getElementById('selectedGuests').textContent = reservationData.guests + '名';
        }

        if (hasCourse) {
            const courseSelect = document.getElementById('courseType');
            const selectedOption = courseSelect.options[courseSelect.selectedIndex];
            document.getElementById('selectedCourse').textContent = selectedOption ? selectedOption.text : '';
        }
    }

    // 次へボタンの有効/無効
    const nextBtn = document.getElementById('nextToStep2');
    nextBtn.disabled = !(hasDateTime && hasGuests && hasCourse);
}

// 前月へ
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// 次月へ
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// イベントリスナー初期化
function initEventListeners() {
    // カレンダーナビゲーション
    document.getElementById('prevMonth').addEventListener('click', prevMonth);
    document.getElementById('nextMonth').addEventListener('click', nextMonth);

    // フォーム入力
    document.getElementById('timeSlot').addEventListener('change', function() {
        const value = this.value;
        if (value) {
            const timeType = value.split('-')[0]; // 'lunch' または 'dinner'
            const time = value.split('-')[1];
            reservationData.time = time;

            // 時間帯に応じてコースメニューを更新
            updateCourseOptions(timeType);

            updateSelectedInfo();
        }
    });

    document.getElementById('guests').addEventListener('change', function() {
        const value = this.value;
        if (value === 'more') {
            alert('9名様以上のご予約は、お電話（03-1234-5678）にてお問い合わせください。');
            this.value = '';
            reservationData.guests = null;
        } else {
            reservationData.guests = value;
        }
        updateSelectedInfo();
    });

    document.getElementById('courseType').addEventListener('change', function() {
        reservationData.course = this.value;
        updateSelectedInfo();
    });

    // ステップナビゲーション
    document.getElementById('nextToStep2').addEventListener('click', () => goToStep(2));
    document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));
    document.getElementById('nextToStep3').addEventListener('click', validateAndGoToStep3);
    document.getElementById('backToStep2').addEventListener('click', () => goToStep(2));
    document.getElementById('submitReservation').addEventListener('click', submitReservation);
    document.getElementById('newReservation').addEventListener('click', resetReservation);

    // 同意チェックボックス
    document.getElementById('agreePolicy').addEventListener('change', function() {
        document.getElementById('submitReservation').disabled = !this.checked;
    });

    // お客様情報フォーム
    ['name', 'nameKana', 'email', 'phone'].forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            reservationData[id] = this.value;
        });
    });

    document.getElementById('requests').addEventListener('input', function() {
        reservationData.requests = this.value;
    });
}

// ステップ移動
function goToStep(stepNumber) {
    // すべてのステップを非表示
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });

    // 指定されたステップを表示
    document.getElementById(`step${stepNumber}`).classList.add('active');

    // ステップインジケーター更新
    for (let i = 1; i < stepNumber; i++) {
        document.querySelector(`.step[data-step="${i}"]`).classList.add('completed');
    }
    document.querySelector(`.step[data-step="${stepNumber}"]`).classList.add('active');

    // ページトップへスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ステップ3へ進む前のバリデーション
function validateAndGoToStep3() {
    const form = document.getElementById('customerForm');
    const name = document.getElementById('name').value.trim();
    const nameKana = document.getElementById('nameKana').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    // バリデーション
    if (!name) {
        alert('お名前を入力してください。');
        document.getElementById('name').focus();
        return;
    }

    if (!nameKana) {
        alert('お名前（フリガナ）を入力してください。');
        document.getElementById('nameKana').focus();
        return;
    }

    // カタカナチェック
    if (!/^[ァ-ヶー\s]+$/.test(nameKana)) {
        alert('フリガナはカタカナで入力してください。');
        document.getElementById('nameKana').focus();
        return;
    }

    if (!email) {
        alert('メールアドレスを入力してください。');
        document.getElementById('email').focus();
        return;
    }

    // メールアドレス形式チェック
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('正しいメールアドレスを入力してください。');
        document.getElementById('email').focus();
        return;
    }

    if (!phone) {
        alert('電話番号を入力してください。');
        document.getElementById('phone').focus();
        return;
    }

    // 電話番号形式チェック
    if (!/^[\d\-]+$/.test(phone)) {
        alert('正しい電話番号を入力してください。');
        document.getElementById('phone').focus();
        return;
    }

    // データ保存
    reservationData.name = name;
    reservationData.nameKana = nameKana;
    reservationData.email = email;
    reservationData.phone = phone;
    reservationData.requests = document.getElementById('requests').value.trim();

    // 確認画面へデータを表示
    displayConfirmation();
    goToStep(3);
}

// 確認画面表示
function displayConfirmation() {
    const date = new Date(reservationData.date);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}） ${reservationData.time}`;

    document.getElementById('confirmDateTime').textContent = dateStr;
    document.getElementById('confirmGuests').textContent = reservationData.guests + '名様';

    const courseSelect = document.getElementById('courseType');
    const selectedOption = courseSelect.options[courseSelect.selectedIndex];
    document.getElementById('confirmCourse').textContent = selectedOption.text;

    document.getElementById('confirmName').textContent = reservationData.name;
    document.getElementById('confirmNameKana').textContent = reservationData.nameKana;
    document.getElementById('confirmEmail').textContent = reservationData.email;
    document.getElementById('confirmPhone').textContent = reservationData.phone;
    document.getElementById('confirmRequests').textContent = reservationData.requests || '（なし）';
}

// Googleフォームへ送信
async function sendToGoogleForm(data) {
    // Googleフォームが設定されていない場合はスキップ
    if (!GOOGLE_FORM_CONFIG.formId) {
        console.warn('Googleフォームが設定されていません。GOOGLE_FORM_SETUP.mdを参照して設定してください。');
        return false;
    }

    try {
        const formUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse`;

        // 日付フォーマット
        const date = new Date(data.date);
        const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}）`;

        // コース名取得
        const courseSelect = document.getElementById('courseType');
        const selectedOption = courseSelect.options[courseSelect.selectedIndex];
        const courseName = selectedOption ? selectedOption.text : data.course;

        // フォームデータ作成
        const formData = new FormData();
        formData.append(GOOGLE_FORM_CONFIG.entries.date, dateStr);
        formData.append(GOOGLE_FORM_CONFIG.entries.time, data.time);
        formData.append(GOOGLE_FORM_CONFIG.entries.guests, data.guests + '名');
        formData.append(GOOGLE_FORM_CONFIG.entries.course, courseName);
        formData.append(GOOGLE_FORM_CONFIG.entries.name, data.name);
        formData.append(GOOGLE_FORM_CONFIG.entries.nameKana, data.nameKana);
        formData.append(GOOGLE_FORM_CONFIG.entries.email, data.email);
        formData.append(GOOGLE_FORM_CONFIG.entries.phone, data.phone);
        formData.append(GOOGLE_FORM_CONFIG.entries.requests, data.requests || 'なし');

        // Googleフォームに送信（no-corsモード）
        await fetch(formUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });

        console.log('Googleフォームへの送信が完了しました');
        return true;

    } catch (error) {
        console.error('Googleフォームへの送信エラー:', error);
        // エラーが発生してもユーザーには通知しない（no-corsのため送信成功かどうか判定不可）
        return true;
    }
}

// 予約送信
async function submitReservation() {
    // 予約番号生成
    const reservationNumber = 'R' + Date.now().toString().slice(-8);

    // 送信ボタンを無効化
    const submitBtn = document.getElementById('submitReservation');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    try {
        // Googleフォームへ送信
        await sendToGoogleForm(reservationData);

        // ローカルストレージに保存（バックアップ）
        let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        reservations.push({
            reservationNumber: reservationNumber,
            ...reservationData,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('reservations', JSON.stringify(reservations));

        // 予約番号表示
        document.getElementById('reservationNumber').textContent = reservationNumber;

        // 完了画面へ
        goToStep(4);

        console.log('予約データ:', reservationData);

    } catch (error) {
        alert('予約の送信中にエラーが発生しました。お手数ですが、お電話（03-1234-5678）にてご予約ください。');
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// 予約リセット
function resetReservation() {
    // データリセット
    reservationData = {
        date: null,
        time: null,
        guests: null,
        course: null,
        name: null,
        nameKana: null,
        email: null,
        phone: null,
        requests: null
    };

    selectedDate = null;
    currentDate = new Date();

    // フォームリセット
    document.getElementById('customerForm').reset();
    document.getElementById('timeSlot').value = '';
    document.getElementById('guests').value = '';
    document.getElementById('courseType').value = '';
    document.getElementById('timeSlot').disabled = true;
    document.getElementById('selectedInfo').style.display = 'none';
    document.getElementById('agreePolicy').checked = false;

    // ステップ1へ
    goToStep(1);

    // カレンダー再描画
    renderCalendar();
}
