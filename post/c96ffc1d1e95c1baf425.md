---
title: Linux wineで、VRChat等 Direct3Dを動作する環境を作る
tags: Linux wine Direct3D
author: onokatio
slide: false
---
Linuxには、Windowsの実行ファイルを仮想的に動作させる、wineがあります。
ただ、wineは描画系ライブラリが未熟なのが現状です。

ここでは、wineでDirect3Dや、DirectX 10, 11を動作させるためのライブラリ導入をしていきます。

# なぜwineでのDirect3Dがうまく動かないのか/遅いのか

wineは、Windowsシステムが標準で持っているライブラリ（LinuxではなくWindowsなので.dll）を自前で実装しています。
その中でも、描画系の開発は比較的遅いです。
Direct 3DやDirect X 10,11を使う際は、ホストのLinuxマシンのiGPU/eGPUに対して直接命令をセず、一旦OpenGL命令を発行しています。

ただ、この現状はWineのバージョンが上がる度に改善されていっているようです。

今回は、wine

# DXVKのインストール

