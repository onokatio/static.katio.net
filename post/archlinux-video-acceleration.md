---
title: ハードウェアビデオアクセラレーション
date: 2019-05-08 12:12:19 +0900
---

ハードウェアビデオアクセラレーション
===

Intel内蔵グラフィックとNvidia GPUが両方載っているマシンで、ハードウェア支援を受けたい、ので書きます。

# ハードウェアビデオアクセラレーションとは

MPEGやVP9のエンコード、デコードをGPUに処理させる仕組みです。CPUに処理させるよりも圧倒的に公立が良いのはすぐにわかりますね。

# VA-APIとVDPAU

VA-API(libva)はIntelが開発したライブラリです。
VDPAUはNVIDIAが開発したライブラリです。
どちらもソフトウェアの中からビデオエンコード/デコードをするためのものです。
たとえばffmpegは両方に対応しています。

これらはソフトウェアなので、実際には利用するGPUが必要です。
両方共、利用するGPUごとにドライバ（バックエンド）が必要です。

VA-APIには、libva-intel-driver、intel-media-driver、libva-mesa-driver、libva-vdpau-driverが存在します。
最新のIntel CPUであれば`libva-intel-driver`が相当します。

VDPAUには、mesa-vdpau、nvidia-utils、libvdpau-va-glが存在します。

## 互換レイヤー

VA-APIでしか対応していないソフトウェアで、Nvidia GPUを使いたい場合は、libva-vdpau-driverを使うことで、VDPAUをバックエンドとしたVA-APIを利用できます。
libvavdpau-va-glを使うことで、Intel内蔵GPUをVDPAUで利用できます。

そのため、「通常時はVA-APIでもVDPAUでもIntel内蔵GPUを使うが、特別なときはVA-APIでもVDPAUでもNvidia GPUを使う」のような設定ができます。

# 設定

今回は、VA-APIでもVDPAUでもIntel内蔵GPUを利用するように設定します。
自分は、ノートPCのバッテリー状況によって動的に変えたいので、手動でNvidia GPUに切り替える設定もしています。

## 通常時の場合

### VA-API

`libva-intel-driver`ドライバをインストールします。
libvaが利用するドライバは、`/usr/lib/dri/${LIBVA_DRIVER_NAME}_drv_video.so`から読み込まれます。
なので`$LIBVA_DRIVER_NAME`に`i965`を設定します。

`vainfo`を実行することで確認できます。

### VDPAU

`/usr/lib/vdpau/libvdpau_${VDPAU_DRIVER}.so`が読み込まれます。
なので`$VDPAU_DRIVER`に`va_gl`を設定します。

`vdpauinfo`を実行することで確認できます。

## 高性能な処理が必要なとき

### VA-API

`$LIBVA_DRIVER_NAME`に`nvidia`を設定します。
`/usr/lib/dri/`以下に、`vdpau_drv_video.so`と`nvidia_drv_video.so`が存在しますが、後者は前者のシンボリックリンクになっています。nvidiaドライバではなくnouveauドライバの場合はおそらくここが変更されるんだと思います。

### VDPAU

`$VDPAU_DRIVER`に`nvidia`を設定します。
# 参考

ハードウェアビデオアクセラレーション - Archwiki。
