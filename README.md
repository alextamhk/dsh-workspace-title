# harness-workspace-title（DSH 外掛）

在 DeepSeek Harness（DSH）Web GUI 的**輸入欄右上方**顯示目前的 **Workspace 名稱**，
文字顏色可在設定頁調整；**不提供字體大小設定** —— 字體沿用輸入區的預設大小。

改編自 [alextamhk/dsh-harness-title](https://github.com/alextamhk/dsh-harness-title) 的想法
（該外掛把自訂標題顯示在畫面最頂部）。本外掛只做一件事：把 Workspace 名字放到輸入欄右上方。

## 效果

- 位置：composer 輸入卡片**上緣右側**（畫面中紅色框的位置），緊貼輸入框上方、靠右對齊。
- 內容：只有 Workspace 名字，沒有前綴、沒有圖示、沒有背景。
- 顏色：可在 **設定 → 通用 → Workspace 名稱** 調整（7 個主題色票 + 任意 CSS 色值）。
- 字體：`font-size: inherit`，跟隨輸入卡片的內容字級（預設 14px，受 ui-theme 的字級設定影響）。
- 不遮擋操作：`pointer-events: none`，點擊會穿過去。

## 安裝

```powershell
# 從 GitHub 安裝（pnpm 會一併安裝本套件自己的依賴）
dsh plugin --profile web add github:alextamhk/dsh-workspace-title

# 或本機開發連結
dsh plugin --profile web add 'link:D:/Projects/plugins/harness-workspace-title'
```

安裝後：

1. Host 端 bundle 由 `patchReload: live` 熱套用，**不需要重啟 `dsh web`**。
2. 瀏覽器需要**硬重新整理（Ctrl+Shift+R）**，client bundle 才會載入。

驗證：

```powershell
dsh plugin --profile web list                 # 應出現 harness-workspace-title
dsh --profile web --dump-config | Select-String 'harness-workspace-title'
```

## 設定

**設定 → 通用** 會多一列「Workspace 名稱」：

| 控制項 | 說明 |
|---|---|
| 顯示 | 總開關 |
| 七個色票 | 主題淡色／次要／主要、藍、綠、黃、紅（都是 `--dsw-*` 主題變數，會跟隨明暗主題） |
| 自訂顏色 | 任意 CSS 色值，例如 `#7cc4ff`、`rgb(124 196 255)`、`var(--dsw-alias-label-secondary)`；按 Enter 或離焦即套用 |
| 預設 | 清空自訂欄位（或填入預設值）並確認，即寫回預設 |

設定存放於 **profile 的 patch 文件**（`~/.dsh/profiles/web/cordis.patch.yml` 的
`harness-workspace-title` 條目 `config`），由 DSH 的設定服務寫入：

```yaml
- id: harness-workspace-title
  name: harness-workspace-title
  config:
    enabled: true
    color: 'var(--dsw-alias-label-tertiary)'
```

## 名稱怎麼來的

與 DSH 自己的 composer workspace chip 用**完全相同**的解析順序，因此兩者不會不一致：

1. 目前 Session 所屬 Workspace 的 `title`；
2. 否則（未分組的 Session）用該 Session `cwd` 的最後一段目錄名；
3. 都沒有 → 不顯示。

刻意**不做**「最近使用的 Workspace」猜測 —— 對一個不屬於任何 Workspace 的 Session，
那樣會顯示一個它其實不在的 Workspace。

## 架構

| 檔案 | 角色 |
|---|---|
| `lib/index.js` | Host 半邊。唯一的實際工作是匯出 `Config` schema：DSH 的 settings 鏡像只服務**有 volatile 欄位**的 Loader 條目，這也是 `ctx.configForms.get()` 能拿到命名空間的原因。 |
| `lib/client.js` | 瀏覽器半邊。手寫的 module-table bundle（`window.__ModuleLoader__.load`），只 `require('react')`。 |
| `cordis.patch.yml` | 插入 Loader 條目 `harness-workspace-title`。 |

Client 半邊掛進兩個 slot：

- `conversation.input.overlay`（ui-conversation 宣告，**session** scope，list）
  —— 這是輸入卡片內一個 `height:0; position:absolute; inset:0 0 auto` 的錨點，
  所以元素以正常流向從卡片上緣排版，再用 `transform: translateY(-100%)` 抬到卡片上方，
  完全不改動 composer 既有版面。輸入卡片沒有 `overflow` 裁切，因此不會被切掉。
- `settings.general.item`（ui-settings-general 宣告，root scope，list）
  —— 「通用」頁的加成式設定列，列自己擁有文案與寫入路徑。

### 為什麼 host 半邊有依賴

以 `link:` 安裝的外掛，Node 是照**真實路徑**解析模組（不是 profile 的 node_modules 捷徑），
所以 **linked 外掛 import 不到 profile 自己的套件**，會以
`ERR_MODULE_NOT_FOUND: Cannot find package '@deepseek-ai/…'` 收場。因此
`@deepseek-ai/schemastery` 是本套件自己的真實依賴（版本對齊 profile 的 3.18.4），
其餘一律不 import —— 這與 `harness-version-checker`／`dsh-balance-topbar` 的零 import 做法一致。

兩種安裝方式都成立：`link:` 時依賴來自本目錄的 `node_modules`（`npm install` 產生），
`github:` 時由 pnpm 從 npm registry 安裝同一個依賴，不必先在本機 build。

## 開發

```powershell
npm install          # 安裝 @deepseek-ai/schemastery
npm test             # node --test（15 項：純函式 + apply/render 功能測試）
```

改動 `lib/client.js` 後**硬重新整理**瀏覽器即可；改動 `lib/index.js`（Config schema）
需要重啟 `dsh web`。沒有建置步驟：`lib/` 就是原始碼，刻意不引入 bundler。

## 疑難排解

| 症狀 | 原因／處置 |
|---|---|
| 完全沒看到名字 | 先硬重新整理。仍無 → 檢查目前 Session 是否真的有 cwd／所屬 Workspace（見上）。 |
| 設定頁沒有「Workspace 名稱」這一列 | `settings.general.item` 由 `dsh-client-ui-settings-general` 宣告，確認它在 profile 的 bundles 內。 |
| 顏色欄位是灰的（不可寫） | settings 鏡像尚未 ready 或該部署為唯讀；等連線就緒即可，或直接改 cordis.patch.yml 的 config。 |
| 名字被截斷成 `…` | 超過 `min(60vw, 460px)` 會省略；這是刻意避免壓到 composer 控制項。 |
| `dsh plugin add` 後名字沒進 `dsh.profile.bundles` | 依 `dsh-plugin-install` skill：`remove` 後再 `add` 一次，讓 reconcile 重新註冊。 |
| 以 `link:` 安裝後 `dsh web` 啟動時 `ERR_MODULE_NOT_FOUND: Cannot find package '@deepseek-ai/schemastery'` | linked 外掛看不到 profile 的套件（見上）；在主機端跑 `npm install` 補依賴，或改用 `github:` 安裝。 |

## 授權

MIT
