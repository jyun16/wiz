# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
make wiz          # src/ → public/js/wiz.min.js (esbuild bundle)
make wiz SM=1     # ソースマップ付きビルド
gulp              # src/ 監視 + 自動リビルド（ソースマップ付き）
make t            # test/ 全テスト実行
node test/<file>.js   # 個別テスト実行
```

## アーキテクチャ

`wiz` はブラウザ・Node.js 両対応のピュア JS ユーティリティライブラリ。ESM のみ (`"type": "module"`)。

**エントリーポイント**: `src/index.js` — すべてのサブモジュールを re-export する。消費側は `import { hoge } from 'wiz'` で利用。

**バンドル除外**: `src/test.js` と `src/debug.js` は esbuild の `--external` で本番バンドルから除かれる。開発・テスト専用。

### モジュール構成

| ファイル | 主要エクスポート |
|---|---|
| `src/index.js` | `d/dd/ddd`, `clone`, `isNull/isEmpty/isString/isArray/isObject/isNumber`, `equal`, `rand/range`, `sleep/usleep`, `expandRange` + 各モジュール全 re-export |
| `src/array.js` | `array2obj`, `arrayUniq`, `arrayChoice`, `arrayShuffle`, `arrayRandomPick`, `arrayChunk`, `arrayDiff`, `arrayable` (Proxy で配列ライクなクラスを作る) |
| `src/string.js` | `toCamel/toSnake/toKebab/toPascal`, `wildMatch`, `randStr/randStrTough`, `hash/compareHash` (crypto-es), `sprintf` |
| `src/object.js` | `objGet/Set/Has/Delete/DeletePath` (ドットパス対応), `objMerge`, `objPick/Omit`, `objFlatten`, `objDiff`, `objMixin` |
| `src/date.js` | dayjs ラッパー: `dateObj`, `ymdStr/hmStr/hmsStr`, `dateAdd/dateDiff/dateStartOf`, `epoch/epoch2date` |
| `src/debug.js` | `p()` — `^R/^G/^B/^Y/^M/^C/^W` カラーコード付きコンソール出力, `cl()` — 呼び出し元ファイル名付き出力 |
| `src/jsobj.js` | カスタムオブジェクト構文パーサー/ダンパー。`[[...]]`=配列(QW), `<<...>>`=Set, `<...>`=quoted Set |
| `src/isa.js` | `ISA(A, B, ...)` — 複数クラスのプロトタイプをマージする多重継承ヘルパー |
| `src/validation.js` | バリデーションルール関数オブジェクト (`required`, `email`, `date`, `password` 等) |
| `src/validator.js` | `Validator` — エラーメッセージ管理付きバリデーター (ja ロケールデフォルト) |
| `src/web/form.js` | `Form` — フィールド定義オブジェクトから正規化・バリデーション・DB マッピング・検索クエリを処理 |
| `src/web/utils.js` | `parseQuery/buildQuery/appendQuery`, `escapeHtml`, `q2w/q2col` (クエリパラメータ → WHERE 句) |
| `src/role.js` | `Role` — ドットパスパーミッション管理。`all` で全許可、`~action` で個別拒否 |
| `src/test.js` | `Test` — `eq/ne/true/false/include/html/ceq/re` アサーション、カウンタ付き結果表示 |
| `src/calendar.js` | カレンダーユーティリティ |

### Form クラスの使い方

`Form` はフィールド定義オブジェクト (`conf`) を受け取り以下を提供する:
- `toDB(p)` — DB インサート用オブジェクト変換（checkbox は `,val1,val2,`、hash フィールドはハッシュ化）
- `toDetail(p)` — 表示用変換（textarea は HTML エスケープ、select/radio はラベル変換）
- `validation()` / `dbValidation(db)` — バリデーション実行
- `mode('search')` — 検索モードに切り替え（`getSearchConf()` が走る）

### Role クラスの使い方

```js
const role = new Role([ 'user.edit.all', 'user.index' ])
role.has('user.edit.delete')  // true（all で全許可）
role.add('user.edit.~delete') // delete のみ拒否
```
