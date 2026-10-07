# 北浅井町内会 LINE システム

この資料は、北浅井町内会のLINEを使った仕組みについて、町民の方向けの案内と、運営・開発に関心のある方向けの構成説明を一つにまとめたものです。

## 町民の皆さまへ

### どんなシステムですか

町内会からのお知らせを受け取ったり、町内会の手続きをスマートフォンから行ったりするための仕組みです。LINE公式アカウントから各画面を開いて利用します。画面の利用には、原則として町内会の住民名簿への登録が必要です。

### できること

| 機能 | できること |
| --- | --- |
| 住民名簿の登録・変更 | 氏名・フリガナ・班・住所、所属カテゴリ、その他の所属、配布方法の希望を登録・更新します。登録したLINEアカウントと名簿を照合します。 |
| 公民館の予約 | 予約状況を確認し、利用希望を送信します。予約の受付後、申込者への受付連絡や管理者への確認依頼をLINEで送る機能があります。 |
| デジタル回覧板 | 今月の回覧・配布物と過去の掲載分を確認します。利用には名簿上の利用許可が必要です。 |
| 行事の出欠回答 | 案内された行事について「出席」「欠席」「未定」を回答します。備考を添えることもでき、回答を変更できます。 |
| LINEでの案内・管理者向け連絡 | LINEのメッセージやボタン操作を受け付けるサーバー機能があります。設定されている内容に応じて、案内や予約の確認に使います。 |

安否確認については、回答記録やURL発行などのサーバー側機能が含まれています。ただし、このリポジトリには町民が操作する安否確認画面が含まれていません。実際に利用できる状態かどうかは、町内会の運営者にご確認ください。

### 使い方と困ったとき

1. 町内会のLINE公式アカウントを開き、メニューや案内にある機能を選びます。
2. 住民登録が必要と表示された場合は、登録フォームで手続きをしてください。
3. 利用できない・回答が送れないなどの場合は、画面の案内を確認し、町内会の管理者へお問い合わせください。

このシステムは町内会の運営を補助するもので、緊急時の通報・救助要請の代わりにはなりません。緊急時は公的な緊急窓口へ連絡してください。

## システムの全体像

住民向け画面はGitHub Pagesなどで公開する静的なウェブページです。LINE内のブラウザー（LIFF）から開き、Google Apps Script（GAS）を通じてGoogleスプレッドシートのデータを読み書きします。LINE Messaging APIは、LINEのWebhook受信やメッセージ送信に使います。

```text
町民のスマートフォン
  └─ LINE公式アカウント / LIFF
       └─ ウェブ画面（本リポジトリのHTML・JavaScript）
            └─ GASウェブアプリ（共通API・処理）
                 ├─ Googleスプレッドシート（名簿・予約・回覧・出欠など）
                 └─ LINE Messaging API（Webhook・メッセージ送信）
```

画面はブラウザー側で動き、GASはリクエストの振り分け、業務処理、シートとの入出力などを担当します。業務ごとにスプレッドシートを分ける設定が可能です。

## リポジトリ構成

| 場所 | 内容 |
| --- | --- |
| `index.html` | 住民名簿の登録・更新フォーム |
| `bookroom/index.html` | 公民館の空き状況確認・予約画面 |
| `notice/index.html` | 今月の回覧・配布物、バックナンバーの画面 |
| `attendance/index.html` | 行事の出欠回答画面 |
| `common/` | LIFF ID/API URL設定、共通の画面部品、スタイル、住民状態の判定、補助処理 |
| `GAS/standalone/` | 複数の画面から利用するGASウェブアプリ/API |
| `GAS/bound-sample/` | スプレッドシートに結び付けて使うLINE送信機能のサンプル |
| `docs/` | 安否確認のデータ設計案と、安定性改善に向けた構成案 |
| `ZZ-liff_kitaasai.code-workspace` | VS Codeで開くためのワークスペース設定 |

### 共通画面部品

- `common/app-config.js`: 画面ごとのLIFF ID、共通GAS URL、登録フォームURLを保持します。
- `common/liff-app.js`: ローカル環境の判定と、住民状態に応じた画面アクセス判定を行います。
- `common/member-check.js`: 名簿照会結果の形式や住民状態を整えます。
- `common/app-shell.css`: アプリ画面の共通レイアウト・スタイルです。
- `common/ui-helpers.js`、`common/ui-patterns.js`: 各画面が利用する表示補助・UIパターンです。
- `common/page-template.html`: 画面作成用のHTMLひな形です。
- `common/logo.png`、`common/logo_square.jpg`、`common/favicon.ico`: 画面で使うロゴ・アイコンです。

### GASのファイル構成

| ファイル | 役割 |
| --- | --- |
| `GAS/standalone/main.gs` | WebアプリのGET/POST入口、POST本文の読み取り |
| `GAS/standalone/router.gs` | リクエストの種類を判断し、処理先へ振り分け |
| `GAS/standalone/config.gs` | Apps Scriptのスクリプトプロパティから設定を読み込む |
| `GAS/standalone/auth.gs` | Webhook秘密値、LINE署名、LIFFトークンの確認処理 |
| `GAS/standalone/response.gs` | JSON/JSONP形式の応答を作成 |
| `GAS/standalone/gateway_sheets.gs` | スプレッドシート・シートの取得、ヘッダー処理、キャッシュ補助 |
| `GAS/standalone/services/member.gs` | 名簿照会・会員情報の取得・登録更新 |
| `GAS/standalone/services/bookroom.gs` | 公民館予約情報の照会・申込処理 |
| `GAS/standalone/services/notice.gs` | 回覧・配布物、閲覧記録、画面ログ等の処理 |
| `GAS/standalone/services/attendance.gs` | 行事情報・出欠回答の照会・登録 |
| `GAS/standalone/services/safety_check.gs` | 安否確認URL発行、照会、登録、回答記録 |
| `GAS/standalone/services/chat.gs` | LINE Webhookや予約関連の操作イベント処理 |
| `GAS/standalone/services/line-push.gs` | LINEへの一斉送信・送信対象の抽出 |
| `GAS/standalone/services/diagnostics.gs` | 接続状態確認と診断記録 |
| `GAS/standalone/jobs/chat_sync.gs` | LINE利用者と名簿を照合する定期実行用処理 |
| `GAS/standalone/appsscript.json` | GASの実行環境設定 |
| `GAS/standalone/README.md` | GAS固有の設定・デプロイ・操作メモ |
| `GAS/bound-sample/` | スプレッドシートのメニュー／ダイアログからLINE送信を呼ぶサンプル |

## 各機能の処理概要

### 住民名簿

画面はLINEのLIFFから利用者情報を得て、GASに名簿照会や登録・更新を依頼します。GASは名簿シートをLINEユーザーIDで照合し、氏名、班、状態、回覧板の利用許可などを返します。登録・更新は既存のLINEユーザーIDの行があれば更新し、なければ追加します。

名簿列は運用シートに合わせて構成されます。主に `line_id`、`name_1st`、`name_2nd`、`group`、`status`、`can_view_notice` 等を使用します。登録画面から送信される項目に応じて、列が追加される実装です。

### 公民館予約

GASは予約台帳を読み、画面へ予約状況を返します。予約の申込では部屋・日付などを受け取り、競合を確認して予約台帳を更新します。「全室予約」は「小会議室」「大広間」の両方を予約し、どちらかに同じ時間帯の予約がある場合は受け付けません。通知を有効にするにはLINEチャネルアクセストークン、通知対象となる管理者情報、友だち追加などの運用設定が必要です。

予約台帳の列や既存データ形式は、運用中のブックと `services/bookroom.gs` を基準にしてください。

### デジタル回覧板

画面には「今月の回覧・配布物」と「バックナンバー」があります。GASは対象月の掲載情報や閲覧対象月を読み出し、アクセス記録等を保存します。名簿の `can_view_notice` が許可を示す値であることも利用条件です。掲載物の登録・保管は運用側で管理するスプレッドシートを使います。

### 行事の出欠

`events` シートから受付中のイベントを探し、イベント名、日時、場所、説明、締切などを画面に返します。選択肢は「出席」「欠席」「未定」です。回答と任意の備考は `answers` シートに保存され、同一イベント・同一LINEユーザーの回答は更新されます。登録済みで利用可能な名簿情報が必要です。

### 安否確認（サーバー機能）

GASにはスプレッドシートの「安否確認」メニューからURLを発行する機能、回答者情報を照合する機能、登録や回答を記録する処理があります。設定により `survey_settings`、`survey_responses`、`survey_access_log` を使います。名簿を住民情報の参照元とし、安否確認専用の重複名簿を作らない方針が設計資料に記されています。

このリポジトリにあるのはサーバー処理と設計情報で、対応する住民向け画面は含まれていません。`docs/safetycheck_reliable_architecture.md` に書かれたAPI Gateway案（LIFFからGASへ直接接続しない構成）は、改善案であり、このワークスペースにGateway実装はありません。

### LINE連携・管理機能

- LINE Webhookを受け付け、署名やURL秘密値の設定に応じて確認してからイベントを処理します。
- LINE Messaging APIを使ったプッシュ送信の処理と、対象者を絞る設定があります。
- 予約の受付・管理者への承認依頼・承認／却下後の連絡に対応する処理があります（通知設定が必要）。
- `runChatHistoryMatchJob` は時間主導トリガーで実行し、LINE利用履歴と名簿をLINEユーザーIDで照合できます。
- 診断APIでは設定フラグや一部シートへの接続を調べ、診断ログを書き込めます。

## APIの概要

GASウェブアプリの入口は `doGet` と `doPost` で、`action` によってサービスを振り分けます。主な操作は次のとおりです。

| HTTP | `action` | 用途 |
| --- | --- | --- |
| GET | `member_check` | LINEユーザーの名簿登録状態を確認 |
| GET | `member_profile_get` | LINEユーザーIDでプロフィールを取得 |
| POST | `member_profile_upsert` | プロフィールを登録・更新 |
| GET | `bookroom_list` | 予約一覧を取得（指定がないGETの既定動作） |
| POST | `bookroom_submit` | 公民館予約を申し込む |
| GET | `notice_bootstrap` | 回覧板初期表示用の情報を取得 |
| GET | `notice_months` | 掲載月一覧を取得 |
| GET | `get_monthly_items` | 指定月の掲載物を取得 |
| GET | `attendance_question` | イベント情報と既存回答を取得 |
| POST | `attendance_answer` | 出欠回答を登録・更新 |
| GET | `safety_check` | 安否確認の対象・登録情報を取得 |
| GET | `safety_check_debug` | 安否確認のデバッグ情報を取得（運用・開発者向け） |
| POST | `safety_check_register` | 安否確認に関連する登録処理 |
| POST | `safety_check_submit` | 安否確認の回答を記録 |
| POST | `line_webhook` | LINE Webhookイベントを処理 |
| GET | `diagnostics` | 設定・接続診断 |
| POST | `diagnostics_write` | 診断用の書き込みを確認 |
| POST | `log` | 画面側の記録を送信 |

一部の画面や旧形式との互換性のため、`type=user`、`qid`、`sid` などからactionを推定する経路もあります。JSONP callbackにも対応する処理が含まれます。詳細な引数や互換形式は `GAS/standalone/router.gs` を参照してください。

## スプレッドシート構成

スプレッドシートIDとシート名はGASのスクリプトプロパティで設定します。デフォルトのシート名は次のとおりです。

| 用途 | デフォルトのシート名 | 主な列・説明 |
| --- | --- | --- |
| 住民名簿 | `users` | `line_id`、`name_1st`、`name_2nd`、`group`、`status`、`can_view_notice` など |
| 公民館予約 | `booklist` | 予約台帳。既存の予約ブックの列構成に合わせます。 |
| LINE利用履歴 | `chat` | LINE利用者との照合に使う履歴 |
| Webhook診断 | `webhook_log` | Webhookや予約通知の診断記録 |
| LINE送信記録 | `push_log` | プッシュ送信の記録 |
| 回覧・配布物 | `monthly_items` | 月ごとの掲載情報 |
| アクセス記録 | `access_log_raw` | 画面アクセス等の記録 |
| API監査記録 | `access_api_log` | API処理結果、処理時間等の記録 |
| 最終利用者情報 | `member_last_seen` | 利用者の最終確認情報 |
| 月次集計 | `summary_monthly` | 月次集計用 |
| 出欠イベント | `events` | `event_id`、`event_name`、`event_datetime`、`event_location`、`description`、`response_deadline`、`status` 等 |
| 出欠回答 | `answers` | `event_id`、`updated_at`、`member_name`、`group_name`、`answer`、`memo`、`line_id` |
| 安否確認設定 | `survey_settings` | `survey_id`、`title`、`created_at`、`published_at`、`issued_url`、`liff_url`、`status` |
| 安否確認回答 | `survey_responses` | 調査ID、回答者、回答状態、回答日時、備考等 |
| 安否確認アクセス記録 | `survey_access_log` | 調査ID、利用者、イベント種別、日時、詳細 |

出欠イベントは `status` が「受付中」のものだけ回答できます。回答・掲載物などの列要件は、実際の処理コードと運用中のシートを照合してください。古いデータや異なるシート名を利用する場合は、設定変更またはコード上の互換処理が必要です。

## 設定・デプロイ（運営・開発者向け）

### フロントエンド

1. `common/app-config.js` の各画面設定を、運用環境のLIFF IDとGASウェブアプリURLに合わせます。
2. GitHub Pagesなど、HTTPSで静的ファイルを配信できる場所にリポジトリの画面を公開します。
3. LINE Developers ConsoleでLIFFアプリを設定し、エンドポイントURLに対応する公開画面を指定します。
4. LINE公式アカウントのメニューや案内から各画面を開けるように設定します。

ページ設定キーは `profile`、`bookroom`、`notice`、`attendance` です。各ページのLIFF IDと共通GAS URLは `common/app-config.js` に置かれています。これらは接続先を示す値であり、アクセストークンや秘密鍵の代わりにはなりません。

### GAS

1. `GAS/standalone/` 内のファイルをスタンドアロンGASプロジェクトに配置します。
2. スクリプトプロパティを設定します（一覧は次節）。
3. 対応するGoogleスプレッドシートとシート、必要なヘッダー行を準備します。
4. ウェブアプリとしてデプロイします。一般に利用する構成では「次のユーザーとして実行」はデプロイ者、「アクセスできるユーザー」はAnyone相当の設定が案内されています。公開範囲とデータ保護要件を確認した上で選んでください。
5. デプロイしたURLをフロントエンド設定へ反映し、LIFF・LINE Webhook・必要な時間主導トリガーを設定します。

`GAS/standalone/.clasp.json` にはclasp用のプロジェクト識別情報が含まれます。デプロイ前に対象プロジェクトと接続先が意図したものか確認してください。

### GASスクリプトプロパティ

**接続先とシート名**

| プロパティ | 用途・既定値 |
| --- | --- |
| `SS_MEMBER_ID` | 住民名簿スプレッドシートID |
| `SS_BOOKROOM_ID` | 公民館予約スプレッドシートID |
| `SS_NOTICE_ID` | 回覧板スプレッドシートID |
| `SS_ATTENDANCE_ID` | 出欠スプレッドシートID |
| `SS_CHAT_ID` | LINE利用履歴のスプレッドシートID。未設定時は `SS_BOOKROOM_ID` |
| `SS_SAFETY_CHECK_ID` | 安否確認スプレッドシートID。未設定時は `SS_MEMBER_ID` |
| `SHEET_MEMBER_MAIN` | 名簿シート。既定 `users` |
| `SHEET_BOOKROOM_MAIN` | 予約シート。既定 `booklist` |
| `SHEET_CHAT_LOG` | LINE利用履歴シート。既定 `chat` |
| `SHEET_WEBHOOK_LOG` | Webhook診断シート。既定 `webhook_log` |
| `SHEET_PUSH_LOG` | 送信記録シート。既定 `push_log` |
| `SHEET_NOTICE_ITEMS` | 回覧掲載シート。既定 `monthly_items` |
| `SHEET_AUDIT_LOG` | アクセス記録シート。既定 `access_log_raw` |
| `SHEET_API_AUDIT_LOG` | API監査シート。既定 `access_api_log` |
| `SHEET_MEMBER_LAST_SEEN` | 最終利用記録シート。既定 `member_last_seen` |
| `SHEET_SUMMARY_MONTHLY` | 月次集計シート。既定 `summary_monthly` |
| `SHEET_ATTENDANCE_EVENTS` | 行事シート。既定 `events` |
| `SHEET_ATTENDANCE_ANSWERS` | 出欠回答シート。既定 `answers` |
| `SHEET_SAFETY_CHECK_SETTINGS` | 安否確認設定シート。既定 `survey_settings` |
| `SHEET_SAFETY_CHECK_RESPONSES` | 安否確認回答シート。既定 `survey_responses` |
| `SHEET_SAFETY_CHECK_ACCESS_LOG` | 安否確認アクセス記録シート。既定 `survey_access_log` |

**LINE・認証・登録先**

| プロパティ | 用途・既定値 |
| --- | --- |
| `REGISTER_FORM_URL` | 住民登録フォームURL。必須 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API送信トークン。送信機能利用時に設定 |
| `LINE_CHANNEL_SECRET` | LINE署名確認用のチャネルシークレット |
| `WEBHOOK_SECRET` | Webhook URLのクエリに設定する秘密値。任意だが推奨 |
| `LINE_SIGNATURE_VERIFY_REQUIRED` | 署名ヘッダーがない場合にWebhookを拒否するか。既定 `false` |
| `LIFF_TOKEN_VERIFY_ENABLED` | 予約・出欠・名簿更新でLIFFトークンの存在を必須にするか。既定 `false` |

**LINE一斉送信**

| プロパティ | 用途・既定値 |
| --- | --- |
| `PUSH_MESSAGE_TEXT` | 条件指定送信で使うメッセージ本文 |
| `PUSH_DRY_RUN` | 試験実行（実送信しない）。既定 `true` |
| `PUSH_REQUIRE_DIGITAL` | デジタル希望者に限定するか。既定 `true` |
| `PUSH_INCLUDE_ROLES` | 対象に含める役割のカンマ区切り指定 |
| `PUSH_EXCLUDE_STATUSES` | 除外する状態。既定 `ng,suspended,blocked,inactive` |
| `PUSH_NOTIFICATION_DISABLED` | 通知送信の停止フラグ。既定 `false` |
| `DIALOG_TARGET_SHEET` | ダイアログ送信の対象シート。既定 `users` |
| `HISTORY_SS_ID` | 送信履歴スプレッドシートID。未設定時は名簿IDを利用 |
| `HISTORY_SHEET_NAME` | 送信履歴シート名。既定 `line_send_history` |

**安否確認・調査URL**

| プロパティ | 用途・既定値 |
| --- | --- |
| `SURVEY_BASE_URL` | 安否確認用GAS URL発行時のベースURL。自動取得できない場合に設定 |
| `LIFF_SAFETY_CHECK_APP_ID` | 安否確認LIFFアプリID。URL設定が他にない場合に必要 |
| `LIFF_SAFETY_CHECK_BASE_URL` | 安否確認用のLIFF完全URL。設定時は `LIFF_BASE_URL` より優先 |
| `LIFF_BASE_URL` | 安否確認LIFFの代替ベースURL |
| `DEBUG_SAFETY_CHECK_SURVEY_ID` | 安否確認デバッグ処理用の調査ID |
| `DEBUG_SAFETY_CHECK_LINE_ID` | 安否確認デバッグ処理用のLINEユーザーID |

これらのうちどの機能にどのプロパティが必要かは、利用するサービスにより異なります。空欄を許容しない設定もあるため、デプロイ先のコードと `config.gs` を確認してください。

## セキュリティと個人情報

- 住民の氏名、班、LINEユーザーID、出欠、利用・閲覧記録などを扱います。GoogleスプレッドシートとGASの共有権限を必要最小限にし、運営者が保管・利用目的を住民に説明してください。
- GitHub Pagesで公開する画面コードは、閲覧者が取得できる公開情報です。秘密情報、アクセストークン、チャネルシークレット、スプレッドシートIDなどの非公開設定値を埋め込まないでください。LINE IDやGAS URLは秘密の認証情報として扱わないでください。
- このリポジトリのAPIは、ウェブアプリを公開アクセス可能にして利用する構成を前提とした箇所があります。公開範囲を「Anyone」にした場合、GAS側の処理と入力検証が実質的な保護境界になります。
- `LIFF_TOKEN_VERIFY_ENABLED` の既定値は `false` です。また現行の `verifyLiffToken` は設定が有効な場合もトークンの有無を確認する実装で、LINEの検証APIへ問い合わせて本人性を確かめる処理ではありません。クライアントから送られるユーザーIDだけで本人と判断する運用は避け、公開前に認証・認可を検証してください。
- GAS WebアプリではLINE署名ヘッダーを取得できない場合があります。`LINE_SIGNATURE_VERIFY_REQUIRED` の既定値は `false` で、ヘッダーがない場合に署名確認を省略する動作があります。Webhook URLの秘密値や署名確認の実効性をデプロイ環境で確認してください。
- 安否確認については、`docs/safetycheck_reliable_architecture.md` がLINEトークン検証やAPI Gateway導入を推奨案として記載していますが、そのGatewayは未実装です。現行の実装と設計案を混同せず、実際の公開前に専門家を含めて安全性を確認してください。
- Google Apps Script、LINE、CDNなど外部サービスに依存します。可用性、利用条件、保存先、障害時の対応を運営者が確認してください。

## 開発・検証

このリポジトリには、一般的なパッケージ管理ファイルや自動テスト定義は含まれていません。画面はHTML/JavaScript、サーバー処理はGoogle Apps Scriptとして管理されています。修正後は、設定値を本番の秘密情報から分離したテスト環境で、各LIFF画面、GAS API、スプレッドシート書き込み、LINE通知を個別に確認してください。実データを使った試験送信は避け、送信機能では `PUSH_DRY_RUN` の設定を確認してください。

## 設計資料

- `docs/safety_check_system_design.md`: 安否確認のシート設計案。名簿を住民情報の参照元にし、回答ログを別に記録する考え方を説明します。
- `docs/safetycheck_reliable_architecture.md`: 安否確認の安定性・認証強化に向けたAPI Gateway、調査トークン、再送制御、監視などの将来案です。提案内容のすべてが現行システムに実装されているわけではありません。

## ライセンス・問い合わせ

このリポジトリにはライセンス条件の記載がありません。利用・再配布を行う場合は、管理者に確認してください。町民向けの操作や登録内容に関するお問い合わせは町内会の管理者へお願いします。
