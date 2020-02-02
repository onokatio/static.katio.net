---
title: Yubikey 5をArchLinuxで使う
tags: yubikey
author: onokatio
slide: false
---
Yubikey 5を買いました。

公式サイトでは、WindowsだけではなくLinuxマシンでも使えるとのことなので、実際に各機能を使っていきたいと思います。

とりあえず買った状態でパッケージから出して、特に何も設定しない状態から進めます。

# FIDO U2F

いわゆる、2段階認証を、SMSやワンタイムトークンアプリではなく、Yubikeyで代用できる機能です。
自分はまずこれを試しました。

GoogleやGithubが対応しています。
Yubikey側では特に何も設定せずとも使えます。

Linux側では、ブラウザがYubikeyをUSB接続のスマートカードだと認識するudevルールを追加します。

```shell-session
$ sudo pacman -S libu2f-host
```

これで、ブラウザからYubikeyのFIDO U2Fを利用できるようになりました。

# FIDO2/webauthN

これは、FIDO U2Fと同じく主にブラウザから使う規格です。
U2Fは二段階認証でしたが、これはYubikeyをパスワード代わりに使用できます。
ユーザーIDとYubikeyでパスワードレスログインです。


現状、対応しているサイトを見つけられなかったため、試していません。

# Challenge and Response

チャレンジレスポンス機能です。
もっと簡単に言うと、YubikeyをHMAC-SHA1署名を吐いてくれる箱として使う機能です。

チャレンジレスポンスでは、Linuxログイン時に、Yubikeyを2段階認証として使うことができます。

自分は試していないので、興味がある方は公式ドキュメントを参照してください。

※SSH時にも使用できるので、サーバーに設定してみるのも良いかもしれません。
※LUKS/dm-cryptのパスワード代わりにも使えるようです。

# OATH-TOTP / OATH-HOTP

- OATH-TOTP(Time-Based One Time Password)は、Google AuthenticatorやAuthyのように、サイトから渡されたQRコード（コード）から、30秒ごとに乱数を作り出し、二段階認証に使う機能です。
- OATH-HOTP(HMAC-Based One Time Password)は、30秒ごとではなく回数ごとに乱数が変化するものです。使われているサービスはあまりありません。

Google AuthenticatorやAuthyは、Googleアカウントや電話番号を失効すると、復活することができません。
Yubikeyを使う場合、Yubikey本体さえなくさなければ問題ありません。

※なくしてしまう心配がある場合、Yubikeyを2セット買い、同じQRコードを両方に登録し、片方はスペアとして自宅等に置いておくことをオススメします。

Yubico Authenticator for Desktopをインストールします。

```shell-session
$ sudo pacman -S ccid opensc yubico-yubioath-desktop
$ sudo systemctl enable pcscd
$ sudo systemctl start pcscd
```

自分はコマンドでインストールしましたが、tar.gz形式でもダウンロード・実行できます。 
https://www.yubico.com/products/services-software/download/yubico-authenticator/

メニューからYubico Authenticatorを起動します。
PCの画面にQRコードを表示した状態で、File→Scan QR Codeを選択し、完了です。

File→Set Passwordで暗号化ができます。

Yubikey 5 NFCの場合は、NFC搭載スマートフォンに「Yubico Authenticator」アプリを入れることで、スマートフォンからでもコードの追加/表示ができます。

# Yubico OTP（One-Time Password）

デフォルトで、yマークをタップするとUSBキーボードとして自動入力される文字列がありますが、それがこれです。

タップする度に乱数が生成され、サービスへのログインに使用できます。
Yubico OTPを採用しているサービスは身の回りになさそうなので、これもパスです。

# スマートカード (PIV)

これは、RSAやECCの鍵を保管し、署名に使える機能です。Windowsのアプリケーション証明書などで使われます。また、SSH鍵を保管することもできます。

PIVだけ別に記事に切り分けました。
[Yubikey 5のPIVで遊ぶ ( SSH鍵生成&保管 )
](https://qiita.com/KazukiSato/items/597ec54bd8654d3a7c25)

# OpenPGP

OpenPGPは、いわゆる公開鍵暗号の方式/プロトコルで、電子署名の作成やデータの暗号化、復号化を行えます。
Linuxには、`gpg`コマンドがあります。（Gnu Privacy Guard - GNUによるpgp実装）

Yubikeyでpgp鍵を登録する方法として、既にある鍵を登録する方法と、Yubikeyに生成させて公開鍵だけパソコンに返す方法があります。

## 既にある鍵を登録(推奨)

以下を実行します。

```
gpg --edit-key `鍵ID`
```
`addkey`を入力します。8→A→Qと入力し、あとはいつもどおり鍵の生成をします。
これで、2つめのサブキーが生成できました、あとで使います。

ここで、`toggle`、`keytocard`を順に入力します。

マスターキーを移動するか？と尋ねられるので、yを押します。
どこに鍵を保管するか尋ねられるので、Signature keyである1を入力します。

```
gpg> keytocard
Really move the primary key? (y/N) y
Please select where to store the key:
   (1) Signature key
   (3) Authentication key
Your selection? 1
```

次に、`key 1`を入力し、`keytocard`を入力します。
また鍵の保管場所を尋ねられるので、Encryption keyである2を入力します。

```
gpg> keytocard
Please select where to store the key:
   (2) Encryption key
Your selection? 2
```

次に、`key 1`と`key 2`を入力し、`keytocard`を入力します。3を選びます。

```
gpg> keytocard
Please select where to store the key:
   (1) Signature key
   (2) Encryption key
   (3) Authentication key
Your selection? 3
```

これで鍵の登録は完了です。

## 鍵をYubikey内で生成

次は、Yubikeyに生成させる方式を試します。

まずは、Yubikeyにpgp鍵を登録するためのピンコードを変更しましょう。

YubikeyをUSBポートに指した状態で`gpg --change-pin`を実行します。

- まず、ピンコードを変更するために1を押し、初期ピンコードである`123456`を入力します。
そうすると、新しいピンコードを求められるので、入力します。リピートを求められるのでそれも入力します。

- 次に、Adminピンコードを変更します。3を押して、同じようにピンコードを登録します。こちらの初期ピンコードは`12345678` です。

両方変更が完了したら、次に実際に鍵を登録します。

先程の画面はQを押し終了させ、`gpg --card-edit`を実行します。
Yubikeyはgpgにpgp鍵を保管できる外部デバイスとして認識されます。

以下のような表示がなされるはずです。

```
Reader ...........: Yubico YubiKey OTP FIDO CCID 00 00
Application ID ...: xxxxxxxxxxxxxxxxxxxxx
Version ..........: 2.1
Manufacturer .....: Yubico
Serial number ....: xxxxxxx
Name of cardholder: [not set]
Language prefs ...: [not set]
Sex ..............: unspecified
URL of public key : [not set]
Login data .......: [not set]
Signature PIN ....: not forced
Key attributes ...: rsa2048 rsa2048 rsa2048
Max. PIN lengths .: 127 127 127
PIN retry counter : x x x
Signature counter : 0
Signature key ....: [none]
Encryption key....: [none]
Authentication key: [none]
General key info..: [none]
```

ここで、`admin`と入力し、Admin commands are allowedと出ることを確認したら、`generate`と入力します。

```
Make off-card backup of encryption key? (Y/n)
```

と、鍵のバックアップを作るかどうか尋ねられるので、Yを押します。

次に、Yubikeyにpgpを登録するために、ピンコードを求められるので先程設定した（変更した）ピンコードを入力します。

ここから先は、通常のgpgでの鍵生成と同じ手順です。

最後に、Adminピンコードを入力すれば、鍵が作られます。

プロンプトは`quit`で終了できます。

## 署名/暗号化

YubikeyをUSBポートに指した状態で`gpg -K`すると、`Card serial no`とともにカード内の鍵が表示されます。これで通常通り署名の作成や、暗号化ができます。

# スロット

Yubikey 5には、上記の機能以外に、2つまで機能を追加することができます。
機能を追加できる領域をスロットとよび、Slot 1とSlot 2が存在します。

スロットに追加できる追加機能は以下です。

- Yubico OTP
- Challenge and Response
- 静的パスワード
- OATH-HOTP

たとえば、Slot 1とSlot 2の両方にOATH-HOTPを追加することで、二段階認証用のキーを、デフォルトの32個にさらに2個追加で、合計34個のサイトの乱数を生成できます。

Slot 1にYubico OTPを、Slot 2に静的パスワードを設定すれば、2種類のYubico OTPアカウントを使い分けられ、パスワードも保管できます。

Yubikeyの金属端子に短く触れるとSlot 1が、長く触れるとSlot 2が動作します。

機能を自由に組み合わせることができます。

# 静的パスワード / Static Password

この機能だけ説明していなかったので追加します。 
これは、任意の文字列をYubikeyに記憶できる機能です。

Yubikey Managerをインストールします。

```shell-session
$ sudo pacman -S yubikey-manager-qt
```

Application→OTPを選ぶと、スロットの設定画面が出てくるため、1か2のどちらかのスロットに設定して完了です。

参考: https://qiita.com/moutend/items/5c22d6e57a74845578f6
https://support.yubico.com/support/solutions/articles/15000006420-using-your-yubikey-with-openpgp

