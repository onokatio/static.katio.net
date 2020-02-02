---
title: Trusted Platform ModuleでSSH鍵を作る
tags: Linux TPM yubikey SSH セキュリティ
author: onokatio
slide: false
---
SSHする際の秘密鍵は、ssh-keygenコマンドなどで生成します。
ただ、最近のマザーボードには、TPMと呼ばれるハードウェア生成器がついているので使ってみましょう。

# Trusted Platform Module とは

TPMとは、Trusted Platform Moduleの略で、耐タンパー性があるチップです。
つまり、物理的な分解、ノイズ解析や、攻撃に耐性があります。
通常のCPUで行う演算の一部を、TPMに委託することで、ある程度安全に暗号計算やハッシュ計算を行えます。

TPMにはバージョンがあり、1.2と2.0が主流です。
機能は以下となります(wikipediaより引用

### TPM 1.0 / 1.2

- RSA演算
- RSA鍵生成
- RSA鍵格納
- SHA-1ハッシュ
- ハッシュ値計算
- ハッシュ値保管
- 乱数生成

TPM1.2から以下の機能が追加された。

- カウンタ
- 単純増加カウンタ
- ティックカウンタ
- オーナー権委任（パスワードは公開しない）
- 不揮発性ストレージ保存機能

### TPM 2.0

- TPM 1.2の機能
- シードとオブジェクトの概念
- 認証形式の追加（KDFによるセッション鍵生成、Policy認証）
- 認証と秘密通信の高速化
- アルゴリズムの大幅な追加
- 各種ハッシュ演算(SHA256、SM3、HMAC、KDFなど)
- 楕円曲線暗号(NIST curve P-256、SM2など)
- AES(128bit～256bit、OFB、CTRなどの各種モード)
- グループの複製(Key duplication)
- 不揮発性カウンタ
- 不揮発性ビットフィールド

# TPMでSSH鍵生成

## ツール/ライブラリのインストール

```
$ sudo modprobe tpm
$ sudo pacman -S  tpm2-tools tpm2-tss
```

これで、`/dev/tpm[0-9]*`、`/dev/tpmrm[0-9]*`とコマンド類が手に入ります。
udevでルールが追加されているので、一回再起動しましょう。

# おわりに

ここまで書いてなんですが、Linuxカーネルでのtpm2は十分にサポートされていないらしく、実際自分の手元でも動作が不安定なため、いつかtpm2がちゃんと動くときまで保留しておきます

参考:

https://blog.hansenpartnership.com/tpm2-and-linux/
https://wiki.archlinux.org/index.php/Trusted_Platform_Module

