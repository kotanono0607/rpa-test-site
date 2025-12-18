// script.js - RPAテストサイト共通JavaScript Ver.1.0

// ========================================
// ユーティリティ関数
// ========================================

/**
 * 現在時刻を取得してフォーマット
 * @returns {string} HH:MM:SS形式の時刻文字列
 */
function 現在時刻を取得() {
  const now = new Date();
  return now.toLocaleTimeString('ja-JP', { hour12: false });
}

/**
 * ログエリアにエントリを追加
 * @param {string} logAreaId - ログエリアのID
 * @param {string} message - ログメッセージ
 */
function ログを追加(logAreaId, message) {
  const logArea = document.getElementById(logAreaId);
  if (!logArea) return;
  
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">[${現在時刻を取得()}]</span>${message}`;
  
  // 最新を上に追加
  logArea.insertBefore(entry, logArea.firstChild);
  
  // 最大50件まで保持
  while (logArea.children.length > 50) {
    logArea.removeChild(logArea.lastChild);
  }
}

/**
 * 結果エリアを更新
 * @param {string} areaId - 結果エリアのID
 * @param {string} content - 表示内容（HTML可）
 * @param {boolean} isActive - アクティブ状態にするか
 */
function 結果を表示(areaId, content, isActive = false) {
  const area = document.getElementById(areaId);
  if (!area) return;
  
  area.innerHTML = content;
  if (isActive) {
    area.classList.add('active');
  } else {
    area.classList.remove('active');
  }
}

// ========================================
// 入力フォームページ用
// ========================================

/**
 * フォームデータを収集して表示
 */
function フォームを送信() {
  const formData = {
    名前: document.getElementById('name')?.value || '',
    メール: document.getElementById('email')?.value || '',
    性別: document.querySelector('input[name="gender"]:checked')?.value || '未選択',
    趣味: Array.from(document.querySelectorAll('input[name="hobby"]:checked')).map(el => el.value),
    都道府県: document.getElementById('prefecture')?.value || '',
    日付: document.getElementById('date')?.value || '',
    備考: document.getElementById('remarks')?.value || ''
  };
  
  const resultHtml = `
    <strong>送信データ:</strong><br>
    名前: ${formData.名前}<br>
    メール: ${formData.メール}<br>
    性別: ${formData.性別}<br>
    趣味: ${formData.趣味.length > 0 ? formData.趣味.join(', ') : 'なし'}<br>
    都道府県: ${formData.都道府県 || '未選択'}<br>
    日付: ${formData.日付 || '未選択'}<br>
    備考: ${formData.備考 || 'なし'}
  `;
  
  結果を表示('form-result', resultHtml, true);
  ログを追加('form-log', 'フォームが送信されました');
}

/**
 * フォームをリセット
 */
function フォームをリセット() {
  document.getElementById('test-form')?.reset();
  結果を表示('form-result', '結果がここに表示されます', false);
  ログを追加('form-log', 'フォームがリセットされました');
}

// ========================================
// オートコンプリート
// ========================================

const 都道府県リスト = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

/**
 * オートコンプリートを初期化
 * @param {string} inputId - 入力フィールドのID
 * @param {string} listId - 候補リストのID
 * @param {Array} items - 候補アイテムの配列
 */
function オートコンプリートを初期化(inputId, listId, items) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;
  
  let selectedIndex = -1;
  
  input.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    list.innerHTML = '';
    selectedIndex = -1;
    
    if (value.length === 0) {
      list.classList.remove('active');
      return;
    }
    
    const filtered = items.filter(item => 
      item.toLowerCase().includes(value)
    );
    
    if (filtered.length === 0) {
      list.classList.remove('active');
      return;
    }
    
    filtered.slice(0, 10).forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.textContent = item;
      div.addEventListener('click', () => {
        input.value = item;
        list.classList.remove('active');
        ログを追加('form-log', `オートコンプリート選択: ${item}`);
      });
      list.appendChild(div);
    });
    
    list.classList.add('active');
  });
  
  input.addEventListener('keydown', function(e) {
    const items = list.querySelectorAll('.autocomplete-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      input.value = items[selectedIndex].textContent;
      list.classList.remove('active');
    } else if (e.key === 'Escape') {
      list.classList.remove('active');
    }
  });
  
  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove('active');
    }
  });
}

// ========================================
// クリックテストページ用
// ========================================

/**
 * マウス座標を更新
 * @param {MouseEvent} e - マウスイベント
 */
function マウス座標を更新(e) {
  const xDisplay = document.getElementById('mouse-x');
  const yDisplay = document.getElementById('mouse-y');
  if (xDisplay) xDisplay.textContent = e.clientX;
  if (yDisplay) yDisplay.textContent = e.clientY;
}

/**
 * ターゲットクリックを処理
 * @param {string} targetName - ターゲット名
 * @param {string} clickType - クリック種別
 */
function ターゲットクリックを記録(targetName, clickType) {
  ログを追加('click-log', `${clickType}: ターゲット${targetName}`);
  
  // クリックカウンターを更新
  const counterId = `count-${targetName.toLowerCase()}`;
  const counter = document.getElementById(counterId);
  if (counter) {
    counter.textContent = parseInt(counter.textContent) + 1;
  }
}

/**
 * クリックテストを初期化
 */
function クリックテストを初期化() {
  // マウス座標トラッキング
  document.addEventListener('mousemove', マウス座標を更新);
  
  // ターゲットボックスのイベント設定
  document.querySelectorAll('.target-box').forEach(box => {
    const name = box.dataset.target;
    
    box.addEventListener('click', function(e) {
      this.classList.add('clicked');
      setTimeout(() => this.classList.remove('clicked'), 300);
      ターゲットクリックを記録(name, '左クリック');
    });
    
    box.addEventListener('dblclick', function(e) {
      ターゲットクリックを記録(name, 'ダブルクリック');
    });
    
    box.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      ターゲットクリックを記録(name, '右クリック');
    });
  });
}

// ========================================
// ドラッグ&ドロップ
// ========================================

/**
 * ドラッグ&ドロップを初期化
 */
function ドラッグドロップを初期化() {
  const draggables = document.querySelectorAll('.draggable-item');
  const dropZones = document.querySelectorAll('.drag-zone');
  
  draggables.forEach(item => {
    item.setAttribute('draggable', 'true');
    
    item.addEventListener('dragstart', function(e) {
      this.classList.add('dragging');
      e.dataTransfer.setData('text/plain', this.id);
      ログを追加('click-log', `ドラッグ開始: ${this.textContent}`);
    });
    
    item.addEventListener('dragend', function() {
      this.classList.remove('dragging');
    });
  });
  
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('drag-over');
    });
    
    zone.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      
      const id = e.dataTransfer.getData('text/plain');
      const draggable = document.getElementById(id);
      if (draggable) {
        this.appendChild(draggable);
        ログを追加('click-log', `ドロップ完了: ${draggable.textContent} → ${this.dataset.zone}`);
      }
    });
  });
}

// ========================================
// 右クリックメニュー
// ========================================

/**
 * 右クリックメニューを初期化
 */
function コンテキストメニューを初期化() {
  const contextArea = document.getElementById('context-menu-area');
  const menu = document.getElementById('context-menu');
  if (!contextArea || !menu) return;
  
  contextArea.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.classList.add('active');
    ログを追加('click-log', `右クリックメニュー表示 (${e.clientX}, ${e.clientY})`);
  });
  
  menu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', function() {
      ログを追加('click-log', `メニュー選択: ${this.textContent}`);
      menu.classList.remove('active');
    });
  });
  
  document.addEventListener('click', function() {
    menu.classList.remove('active');
  });
}

// ========================================
// キーボードテストページ用
// ========================================

/**
 * キー入力を処理
 * @param {KeyboardEvent} e - キーボードイベント
 */
function キー入力を処理(e) {
  e.preventDefault();
  
  let keyDisplay = '';
  const modifiers = [];
  
  if (e.ctrlKey) modifiers.push('Ctrl');
  if (e.altKey) modifiers.push('Alt');
  if (e.shiftKey) modifiers.push('Shift');
  if (e.metaKey) modifiers.push('Meta');
  
  let keyName = e.key;
  // 特殊キーの表示名を調整
  switch (e.key) {
    case ' ': keyName = 'Space'; break;
    case 'ArrowUp': keyName = '↑'; break;
    case 'ArrowDown': keyName = '↓'; break;
    case 'ArrowLeft': keyName = '←'; break;
    case 'ArrowRight': keyName = '→'; break;
    case 'Control': keyName = ''; break;
    case 'Alt': keyName = ''; break;
    case 'Shift': keyName = ''; break;
    case 'Meta': keyName = ''; break;
  }
  
  if (keyName) modifiers.push(keyName);
  keyDisplay = modifiers.join(' + ');
  
  if (keyDisplay) {
    const display = document.getElementById('key-display');
    if (display) display.textContent = keyDisplay;
    
    ログを追加('key-log', `キー検出: ${keyDisplay} (code: ${e.code})`);
  }
}

/**
 * キーボードテストを初期化
 */
function キーボードテストを初期化() {
  const inputArea = document.getElementById('key-input-area');
  if (!inputArea) return;
  
  inputArea.setAttribute('tabindex', '0');
  inputArea.addEventListener('keydown', キー入力を処理);
  inputArea.addEventListener('focus', function() {
    ログを追加('key-log', 'キー入力エリアがフォーカスされました');
  });
}

// ========================================
// 待機テストページ用
// ========================================

/**
 * 遅延表示をテスト
 * @param {number} delay - 遅延時間（ミリ秒）
 */
function 遅延表示テスト(delay) {
  const loadingArea = document.getElementById('loading-area');
  const resultArea = document.getElementById('wait-result');
  const nextButton = document.getElementById('next-step-btn');
  
  if (!loadingArea || !resultArea) return;
  
  // ローディング表示
  loadingArea.classList.remove('hidden');
  resultArea.classList.add('hidden');
  if (nextButton) nextButton.classList.add('hidden');
  
  ログを追加('wait-log', `${delay / 1000}秒待機開始...`);
  
  setTimeout(() => {
    loadingArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    if (nextButton) nextButton.classList.remove('hidden');
    
    ログを追加('wait-log', '要素が表示されました');
  }, delay);
}

/**
 * 段階的表示をテスト
 */
function 段階的表示テスト() {
  const steps = document.querySelectorAll('.step-item');
  if (steps.length === 0) return;
  
  // すべてのステップを非表示
  steps.forEach(step => step.classList.add('hidden'));
  
  ログを追加('wait-log', '段階的表示開始');
  
  steps.forEach((step, index) => {
    setTimeout(() => {
      step.classList.remove('hidden');
      ログを追加('wait-log', `ステップ${index + 1} 表示`);
    }, (index + 1) * 1000);
  });
}

/**
 * プログレスバーをテスト
 * @param {number} duration - 完了までの時間（ミリ秒）
 */
function プログレスバーテスト(duration) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  if (!progressBar) return;
  
  let progress = 0;
  const interval = 50;
  const increment = 100 / (duration / interval);
  
  ログを追加('wait-log', 'プログレスバー開始');
  
  const timer = setInterval(() => {
    progress = Math.min(progress + increment, 100);
    progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = Math.round(progress) + '%';
    
    if (progress >= 100) {
      clearInterval(timer);
      ログを追加('wait-log', 'プログレスバー完了');
    }
  }, interval);
}

// ========================================
// テーブルページ用
// ========================================

const サンプル商品データ = [
  { id: '001', 名前: 'りんご', 価格: 100, 在庫: 50, 状態: 'あり' },
  { id: '002', 名前: 'みかん', 価格: 80, 在庫: 0, 状態: 'なし' },
  { id: '003', 名前: 'ぶどう', 価格: 300, 在庫: 25, 状態: 'あり' },
  { id: '004', 名前: 'いちご', 価格: 250, 在庫: 30, 状態: 'あり' },
  { id: '005', 名前: 'メロン', 価格: 1500, 在庫: 5, 状態: 'あり' },
  { id: '006', 名前: 'バナナ', 価格: 120, 在庫: 0, 状態: 'なし' },
  { id: '007', 名前: 'キウイ', 価格: 150, 在庫: 40, 状態: 'あり' },
  { id: '008', 名前: 'パイナップル', 価格: 400, 在庫: 10, 状態: 'あり' },
  { id: '009', 名前: 'マンゴー', 価格: 500, 在庫: 0, 状態: 'なし' },
  { id: '010', 名前: 'さくらんぼ', 価格: 800, 在庫: 15, 状態: 'あり' },
  { id: '011', 名前: '桃', 価格: 350, 在庫: 20, 状態: 'あり' },
  { id: '012', 名前: '梨', 価格: 200, 在庫: 35, 状態: 'あり' },
  { id: '013', 名前: 'スイカ', 価格: 900, 在庫: 8, 状態: 'あり' },
  { id: '014', 名前: 'レモン', 価格: 60, 在庫: 0, 状態: 'なし' },
  { id: '015', 名前: 'オレンジ', 価格: 90, 在庫: 60, 状態: 'あり' },
];

let 現在のページ = 1;
const 1ページあたりの件数 = 5;
let フィルター済みデータ = [...サンプル商品データ];

/**
 * テーブルを描画
 */
function テーブルを描画() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;
  
  const startIndex = (現在のページ - 1) * 1ページあたりの件数;
  const pageData = フィルター済みデータ.slice(startIndex, startIndex + 1ページあたりの件数);
  
  tbody.innerHTML = pageData.map(item => `
    <tr data-id="${item.id}">
      <td>${item.id}</td>
      <td>${item.名前}</td>
      <td>¥${item.価格.toLocaleString()}</td>
      <td>${item.在庫}</td>
      <td><span class="badge ${item.状態 === 'あり' ? 'badge-success' : 'badge-danger'}">${item.状態}</span></td>
      <td>
        <button class="btn btn-primary" onclick="行を選択('${item.id}')" style="padding: 6px 12px; font-size: 0.85rem;">選択</button>
      </td>
    </tr>
  `).join('');
  
  ページネーションを更新();
}

/**
 * ページネーションを更新
 */
function ページネーションを更新() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  const totalPages = Math.ceil(フィルター済みデータ.length / 1ページあたりの件数);
  
  let html = `<button onclick="ページを変更(${現在のページ - 1})" ${現在のページ <= 1 ? 'disabled' : ''}>&lt; 前へ</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    html += `<button onclick="ページを変更(${i})" class="${i === 現在のページ ? 'active' : ''}">${i}</button>`;
  }
  
  html += `<button onclick="ページを変更(${現在のページ + 1})" ${現在のページ >= totalPages ? 'disabled' : ''}>次へ &gt;</button>`;
  
  pagination.innerHTML = html;
}

/**
 * ページを変更
 * @param {number} page - ページ番号
 */
function ページを変更(page) {
  const totalPages = Math.ceil(フィルター済みデータ.length / 1ページあたりの件数);
  if (page < 1 || page > totalPages) return;
  
  現在のページ = page;
  テーブルを描画();
  ログを追加('table-log', `ページ${page}に移動`);
}

/**
 * テーブルを検索
 */
function テーブルを検索() {
  const searchInput = document.getElementById('table-search');
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase();
  
  フィルター済みデータ = サンプル商品データ.filter(item =>
    item.名前.toLowerCase().includes(query) ||
    item.id.includes(query)
  );
  
  現在のページ = 1;
  テーブルを描画();
  ログを追加('table-log', `検索: "${query}" (${フィルター済みデータ.length}件)`);
}

/**
 * 行を選択
 * @param {string} id - 行ID
 */
function 行を選択(id) {
  const item = サンプル商品データ.find(d => d.id === id);
  if (item) {
    結果を表示('table-result', `選択された商品: ${item.名前} (ID: ${item.id}, ¥${item.価格.toLocaleString()})`, true);
    ログを追加('table-log', `行選択: ${item.名前}`);
  }
}

// ========================================
// ポップアップ・モーダルページ用
// ========================================

/**
 * アラートを表示
 */
function アラートを表示() {
  ログを追加('popup-log', 'アラート表示');
  alert('これはアラートメッセージです！\nRPAでOKボタンをクリックしてください。');
  ログを追加('popup-log', 'アラート閉じられました');
}

/**
 * 確認ダイアログを表示
 */
function 確認ダイアログを表示() {
  ログを追加('popup-log', '確認ダイアログ表示');
  const result = confirm('この操作を実行しますか？');
  ログを追加('popup-log', `確認ダイアログ結果: ${result ? 'はい' : 'いいえ'}`);
  結果を表示('popup-result', `選択結果: ${result ? 'はい（OK）' : 'いいえ（キャンセル）'}`, true);
}

/**
 * プロンプトを表示
 */
function プロンプトを表示() {
  ログを追加('popup-log', 'プロンプト表示');
  const result = prompt('お名前を入力してください:', '');
  ログを追加('popup-log', `プロンプト入力: ${result || '(キャンセル)'}`);
  if (result !== null) {
    結果を表示('popup-result', `入力された名前: ${result || '(空)'}`, true);
  }
}

/**
 * モーダルを開く
 * @param {string} modalId - モーダルのID
 */
function モーダルを開く(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    ログを追加('popup-log', `モーダル表示: ${modalId}`);
  }
}

/**
 * モーダルを閉じる
 * @param {string} modalId - モーダルのID
 */
function モーダルを閉じる(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    ログを追加('popup-log', `モーダル閉じ: ${modalId}`);
  }
}

/**
 * モーダルアクションを実行
 * @param {string} action - アクション名
 */
function モーダルアクション(action) {
  結果を表示('popup-result', `モーダルアクション: ${action}`, true);
  ログを追加('popup-log', `モーダルボタン: ${action}`);
  モーダルを閉じる('test-modal');
}

// ========================================
// 動的コンテンツページ用
// ========================================

/**
 * 動的要素を追加
 */
function 動的要素を追加() {
  const container = document.getElementById('dynamic-container');
  if (!container) return;
  
  const loadingIndicator = document.getElementById('dynamic-loading');
  if (loadingIndicator) loadingIndicator.classList.remove('hidden');
  
  ログを追加('dynamic-log', '動的要素読み込み中...');
  
  setTimeout(() => {
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    
    const newElement = document.createElement('div');
    newElement.className = 'card';
    newElement.id = 'dynamic-element-' + Date.now();
    newElement.innerHTML = `
      <div class="card-title">🆕 動的に生成された要素</div>
      <p>この要素はボタンクリック後に追加されました。</p>
      <p>生成時刻: ${現在時刻を取得()}</p>
      <button class="btn btn-success" onclick="動的ボタンクリック(this)">クリックしてください</button>
    `;
    
    container.appendChild(newElement);
    ログを追加('dynamic-log', `要素追加完了: ${newElement.id}`);
  }, 2000);
}

/**
 * 動的ボタンがクリックされた時の処理
 * @param {HTMLElement} button - クリックされたボタン
 */
function 動的ボタンクリック(button) {
  const parent = button.closest('.card');
  ログを追加('dynamic-log', `動的ボタンクリック: ${parent?.id || '不明'}`);
  結果を表示('dynamic-result', '動的要素内のボタンがクリックされました！', true);
}

/**
 * AJAX風データ読み込み
 */
function データを読み込む() {
  const dataArea = document.getElementById('ajax-data');
  const loadBtn = document.getElementById('load-data-btn');
  if (!dataArea) return;
  
  if (loadBtn) loadBtn.disabled = true;
  dataArea.innerHTML = '<div class="spinner"></div><p class="loading-text">データ読み込み中...</p>';
  
  ログを追加('dynamic-log', 'AJAXリクエスト開始');
  
  setTimeout(() => {
    const data = [
      { id: 1, title: '項目A', value: Math.floor(Math.random() * 100) },
      { id: 2, title: '項目B', value: Math.floor(Math.random() * 100) },
      { id: 3, title: '項目C', value: Math.floor(Math.random() * 100) },
    ];
    
    dataArea.innerHTML = `
      <table>
        <tr><th>ID</th><th>タイトル</th><th>値</th></tr>
        ${data.map(d => `<tr><td>${d.id}</td><td>${d.title}</td><td>${d.value}</td></tr>`).join('')}
      </table>
    `;
    
    if (loadBtn) loadBtn.disabled = false;
    ログを追加('dynamic-log', 'データ読み込み完了');
  }, 1500);
}

/**
 * 動的コンテンツをクリア
 */
function 動的コンテンツをクリア() {
  const container = document.getElementById('dynamic-container');
  if (container) {
    container.innerHTML = '';
    ログを追加('dynamic-log', '動的コンテンツをクリア');
  }
  
  結果を表示('dynamic-result', '結果がここに表示されます', false);
}

// ========================================
// ファイルアップロード
// ========================================

/**
 * ファイルアップロードを初期化
 */
function ファイルアップロードを初期化() {
  const dropArea = document.getElementById('file-drop-area');
  const fileInput = document.getElementById('file-input');
  
  if (!dropArea || !fileInput) return;
  
  dropArea.addEventListener('click', () => fileInput.click());
  
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('drag-over');
  });
  
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('drag-over');
  });
  
  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('drag-over');
    ファイルを処理(e.dataTransfer.files);
  });
  
  fileInput.addEventListener('change', () => {
    ファイルを処理(fileInput.files);
  });
}

/**
 * ファイルを処理
 * @param {FileList} files - ファイルリスト
 */
function ファイルを処理(files) {
  if (files.length === 0) return;
  
  const file = files[0];
  ログを追加('form-log', `ファイル選択: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
  結果を表示('file-result', `選択されたファイル: ${file.name}<br>サイズ: ${(file.size / 1024).toFixed(1)}KB<br>種類: ${file.type || '不明'}`, true);
}

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  // 現在のページに応じた初期化
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  switch (currentPage) {
    case 'form.html':
      オートコンプリートを初期化('autocomplete-input', 'autocomplete-list', 都道府県リスト);
      ファイルアップロードを初期化();
      break;
    case 'click.html':
      クリックテストを初期化();
      ドラッグドロップを初期化();
      コンテキストメニューを初期化();
      break;
    case 'keyboard.html':
      キーボードテストを初期化();
      break;
    case 'table.html':
      テーブルを描画();
      break;
  }
  
  console.log('RPA Test Site initialized:', currentPage);
});
