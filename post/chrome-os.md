---
title: Chromium OSのアーキテクチャについて調べてみた
date: 2019-06-23 01:58:26 +0900
---

Chromium OSのアーキテクチャについて調べてみた
===

確かLinuxのはずだけど、どうなってんだろうなー、と思ったので。

# 概要

Chromium OSのドキュメントを読んでいきます。

https://www.chromium.org/chromium-os/chromiumos-design-docs/software-architecture

![](https://i.imgur.com/5M5djLJ.png)
![](https://i.imgur.com/xdExw5U.png)

内容としては、Linuxの上でウィンドウマネージャとChromiumが動作しており、すべてのアプリケーションはWeb Appとして動作しています。

また、OSが依存しているツールは以下です。


>- D-Bus: The browser uses D-Bus to interact with the rest of the system. Examples of this include the battery meter and network picker. 
>- Connection Manager: Provides a common API for interacting with the network devices, provides a DNS proxy, and manages network services for 3G, wireless, and ethernet.
>- WPA Supplicant: Used to connect to wireless networks.
>- Autoupdate: Our autoupdate daemon silently installs new system images. 
>- Power Management: (ACPI on Intel) Handles power management events like closing the lid or pushing the power button. 
>- Standard Linux services: NTP, syslog, and cron.

内容的にはUbuntu等と変わらず、wpa supplicantやDBusを利用している。

# ファームウェア/ブートローダー

ブートローダーとしてU-Bootを利用している。
また、BIOSが既に動作していない端末の場合、Androidと同じくEEPROM上に2つの領域を確保し、A/B Partition方式でファームウェアを起動している。

# ウィンドウマネージャー

https://www.chromium.org/developers/design-documents/aura

GUIを提供する方法として、概要で見た図の通りX Window Systemが動作している。
また、ウィンドウマネージャ兼プラットフォーム間の差異を吸収するライブラリとして、Auraと呼ばれるソフトウェアが動作してる。(LinuxでいうGTK + Mutter)

以下の2つの図はブラウザとしてのChromeのドキュメントに記載されているもの。

![](https://i.imgur.com/CSjO3bs.png)

また、X Window Systemのコンポジターとしては、`Chrome Compositor`がその役割を担う。

![](https://i.imgur.com/tSRzhBH.png)

（上と同じ図）

コンポジターはアニメーションの管理を行っている。

# セキュリティ対策

- SELinux/MACの有効化
- ルートパーティション以下を書き込み不可でマウントしている。
- ホームディレクトリがあるパーテーションには、noexecが付与されている。（そのため実行ファイルの実行ができない）
- Xorgにケイパビリティをもたせ、非rootユーザーから起動
- iptablesで標準的なファイアウォール
- ユーザーごとのホームディレクトリ暗号化（eCryptfsでスタック型ファイルベース暗号化）

### ファームウェア周り

起動時にシステムパーテーションが改変されていないか検証するため、パーテーションを4kBずつ分割し、ハッシュツリーを生成。起動時に検証している。

https://www.chromium.org/chromium-os/chromiumos-design-docs/verified-boot

また、ファームウェアはカーネル署名を検証してから起動するようになっている。

### minijail

minijail is a small executable that can be used by root and non-root users to perform a range of behaviors when launching a new executable:

    Dropping capabilities from the bounding set
    Enable/disable capabilities
    chroot
    Dropping root (uid+gid)
    Setting securebits (SECURE_NOROOT, SET_DUMPABLE)
    Setting rlimits
    Process namespacing:
        Will act as init for any pid namespaces
        Will mount /proc in any child vfs namespaces
        Will support uts namespacing (not required)
        Will support user namespacing (in the future)
        Will support IPC namespacing (binary decision)
        Will support net namespacing (for locking down network interfaces w/
        
minijailと呼ばれる、jailのような実行環境を用意できる。Namespaceごとに区切った環境のため、PIDなどは隠蔽される。

### ログイン処理

通常はGoogle Account Serviceに問い合わせを行いGoogleのアカウントでログインを行う。
サービスがオフラインの場合、本体のTPMに保管されたユーザーごとの鍵を取り出し、ユーザーデータを復号化、起動する。あらたにオンライン状態になった場合、新しい鍵をGoogle Accountから持ってくる。

# init

/sbin/initはUpStartを使っている。
