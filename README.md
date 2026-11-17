# Crop and Stream

Crop and Streamは、画面の一部を切り取って、その部分を共有するためのウィンドウを作るシンプルなデスクトップアプリケーションです。
画面全体から必要な部分だけを切り出し、配信やGoogle Meet、Zoomなどの会議ソフトに画面を共有できます。
通常の画面共有の選択肢である「画面全体」「ウィンドウ」「ブラウザタブ」とは異なる、画面の一部分を切り取って共有する機能を提供します。

## デモ

https://github.com/user-attachments/assets/77d34727-377d-4f64-8ade-0fff7ba935d2

## 使い方

起動すると、そのまま画面を切り取るための範囲指定モードになりますので、やっていってください

### 注意事項

共有用ウィンドウは最小化すると動作を停止します。
共有用ウィンドウの上にマウスポインタが乗った場合、マウスポインタ自身の表示も画面共有に含まれます。
そのため、共有用ウィンドウは邪魔にならない隅っこに配置しておくことをおすすめします。

## インストール

[最新リリース](https://github.com/nekobato/cropanst/releases/latest)から、お使いの環境に合うファイルをダウンロードしてください。v0.0.7 の配布ファイルは次のとおりです。

| 環境 | ダウンロード |
| --- | --- |
| macOS / Apple Silicon | [Crop-and-Stream-0.0.7-arm64.dmg](https://github.com/nekobato/cropanst/releases/download/v0.0.7/Crop-and-Stream-0.0.7-arm64.dmg) |
| macOS / Intel | [Crop-and-Stream-0.0.7.dmg](https://github.com/nekobato/cropanst/releases/download/v0.0.7/Crop-and-Stream-0.0.7.dmg) |
| Windows / x64 | [Crop-and-Stream-Setup-0.0.7.exe](https://github.com/nekobato/cropanst/releases/download/v0.0.7/Crop-and-Stream-Setup-0.0.7.exe) |

macOS は DMG を開いてアプリをインストールし、Windows は EXE を実行してインストーラーの案内に従ってください。
`.blockmap` や `latest*.yml` は更新用のファイルで、手動インストールには不要です。

Windows 版のインストーラーも配布していますが、この README で動作確認環境として記載しているのは下記の macOS のみです。Windows の動作確認済み環境を示すものではありません。

## 動作確認環境

macOS 14.6.1 (Sonoma)

## 類似ソフトウェア

- [OBS Studio](https://obsproject.com/)
  - 画面全体のキャプチャを選択した後、クロップすることで同様のことができます

## ライセンス

MIT
