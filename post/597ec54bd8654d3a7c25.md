---
title: Yubikey 5のPIVで遊ぶ ( SSH鍵生成&保管 )
tags: Linux yubikey piv SSH
author: onokatio
slide: false
---
# Yubikey 5のPIVで遊ぶ ( SSH鍵生成&保管 )

Yubikeyには、PIVという規格/機能が備わっています。これを使って、SSH秘密鍵を生成したり、認証情報を保管したり、署名することができるので、今回はそれで遊びます。

# PIV とは

PIVは、Personal Identity Verificationの略で、アメリカ連邦政府で使われているスマートカードの規格です。
連邦職員が所持している身分証明カードは、このPIV規格に沿ったICチップが入っており、自分の身分を証明するために使用します。

Yubikeyがあれば、PIV対応のハード/ソフトで認証に使用したりすることができます。
ただ、日本でPIV認証に対応した場所はありません。
なので、今回はPIVにあるRSA/ECC鍵を生成して保管する機能を使って、SSH秘密鍵保管庫としてYubiukeyで遊んでみようと思います。

**要するに「内部で秘密鍵を保管してくれて、ファイルや文字列をぶん投げると署名して返してくれるUSBデバイス」です。**

# YubikeyのPIV

- PIV機能に対応したYubikeyは、Yubikey 4,5,NEOです。また、NEOはECC鍵に対応しておらず、RSA鍵しか使えません。

- USB接続だけではなく、NFCでも使用できます。

- YubikeyのPIVには、9a 9c 9d 9eの計4つの「スロット」があります。
つまり、4つの秘密鍵を保管することができます。

- 既にある秘密鍵をYubikeyに保管させることもできますが、Yubikey内で秘密鍵を生成し、公開鍵だけ出力することで、一切秘密鍵を外に持ち出せないようにすることもできます。
そちらのほうが安全なので、今回は後者を使います。

- 対応するアルゴリズムは RSA 1024, RSA 2048, ECC secp256r1 です。

- YubikeyのPIV鍵は、PINコードで保護されており、PINコードを入力しないとYubikeyに物理的にアクセスできても使うことはできません。

- 9a 9c 9d 9eの各スロットは、もともとは利用目的があるため、微妙にPINコードの管理が異なります。
 9aと9dは、認証に使うため（パソコンにセットするとか）に作られたため、一度PINコードを入力するとUSB接続が切れるまで使えます。
 9cはファイルのデジタル署名に使うため、署名するたびにPINコードが必要になります。
 9eは、建物の入館時のドアロックの解除などに使うため、PINコードが必要ありません。
**まーーー我々は連邦職員じゃないので、好きなスロット使えば良いですね。**

- 実はスロットは9a 9c 9d 9e以外にも82 83 84 ... 95まで20個あります。ここには、9a 9c 9d 9eに以前登録していた鍵が保存されています。
 つまり、間違えて、使ってるスロットの鍵を上書きしちゃっても、順次以前使っていた鍵がこのスロットにスライドされて来るのでなんとかなります。

# ツールのインストール

```console
$ sudo pacman  -S yubikey-manager opensc ccid
```

# 鍵の生成

```console
$ ykman piv generate-key -a RSA2048 9a pubkey.pem
$ ykman piv generate-certificate -s "SSH Key" 9a pubkey.pem
```

スロット9aに、RSA2048bitの鍵を生成します。公開鍵はpubkey.pemという名前でカレントディレクトリに生成されます。
また、２つ目のコマンドで、SSHに使用する情報の生成やスロットへの名前付をしています。

# sshクライアントの設定

`.ssh/config`に、以下のようにホスト情報を追記します。
IdentityをPKCS11Providerに置き換えて使えます。

```
Host hoge.com
  User fuga
  PKCS11Provider /usr/lib/opensc-pkcs11.so
```

これで、sshするときにPINコードが尋ねられます。
YubikeyのデフォルトPINコードは`123456`です。

# 公開鍵の変換

Yubikeyの公開鍵を、sshが使える形式に変換します。

```console
$ ssh-keygen -i -m PKCS8 -f pubkey.pem > pubkey.txt
```

pubkey.txtの中には、見覚えのある文字列（公開鍵）があるので、ssh先の`.ssh/authorized_keys`に貼り付けましょう。

# おまけ
## PINコードの変更

デフォルトのPINコードは`123456`で脆弱なため、変更しましょう。
変更するコマンドは以下です。

```console
$ ykman piv change-pin
```

## PINコードブロックの解除

PINコードの入力を3回以上間違えると、PINコードがブロックされ、PIV機能が使えなくなります。
PUKコードを使うことで、PINコードを新しものに変更できます。

```console
$ ykman piv unblock-pin
```

デフォルトのPUKコードは`12345678`です。（デフォルトのPINコードの末尾に78を追加）

## PUKコードの変更

```console
$ ykman piv unblock-pin
```

## PIVリセット

PINコードもPUKコードも忘れてしまった場合、YubikeyのPIV機能をすべてリセットすることができます。
もちろん、保管してある鍵はすべて消去されます。

```console
$ ykman piv reset
```

## マネジメントキー

マネジメントキーは、鍵の生成やインポートに使います。

デフォルトのマネジメントキーは`010203040506070801020304050607080102030405060708`です。

自分はマネジメントキーは変更する必要はないと思いますが、変更したい人は`ykman piv change-management-key`で変更できます。

# まとめ

これで、ssh鍵を物理的に安全に保つことができるようになりました。新しいマシンを触る度に鍵を生成してgithubに公開鍵を登録するよりかは、よっぽど便利なので、ぜひ使っていきたいですね。

# 参考
https://orebibou.com/2019/03/macos%E3%81%A7ssh-agent%E3%81%AByubikey%E3%81%AE%E9%8D%B5%E3%82%92%E7%99%BB%E9%8C%B2%E3%81%99%E3%82%8Bopensc%E7%B5%8C%E7%94%B1/
https://developers.yubico.com/PIV/Guides/SSH_with_PIV_and_PKCS11.html
https://wiki.archlinux.org/index.php/YubiKey#CCID_Smartcard

