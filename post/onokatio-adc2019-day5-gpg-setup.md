---
title: "GPGを本格的に運用する"
date: 2019-12-05 23:41:00 +0900
---

GPGを本格的に運用する
===

この記事は [onokatio Advent Calendar 2019](https://blog.katio.net/adventcalendar/2019/onokatio) 5日目の記事です。

# GPGとは

GPG(GNU Prvacy Guard)は、PGP(Pretty Good Privacy)のGNU実装です。主に、公開鍵暗号を使った暗号化、復号化、電子署名の作成、検証が行なえます。

GPG/PGP互換の暗号/署名プロトコルは、電子メールやgit、keybase等で使用されています。

今回は、今までないがしろにしていたLinux内部のGPGをきちんと設定し、身の回りで使っていくことを目標とします。

# 鍵の概念

公開鍵暗号にあまり詳しくない方向けに書きました。ご存知の方はさくっと読み飛ばしてください。

軽くまとめてみます。
GPGは、master keyと、subkeyの2種類の鍵ペアが存在します。  
master keyは主にsubkeyへ署名するためにだけ使用し、普段の操作にはmaster keyの虎の威を借りた（これを証明証チェーンだとか、トラストチェーンと呼びます）subkeyを使用します。 

つまり、master keyの秘密鍵でsubkeyの公開鍵を署名し、subkeyはもらった署名を大事に保管し各地で見せびらかします。これにより、subkeyはmaster keyの持ち主が発行した有効な鍵であることの証明ができます。

# 鍵の生成・管理

今回、gpg鍵はArchlinux内部で生成し、そのmaster keyとsubkeyを、自分が所持しているYubikey 2つに複製し保管します。

参考

自分が書いた過去のブログ : https://blog.katio.net/page/Yubikey  
Archwiki : https://wiki.archlinux.jp/index.php/GnuPG  
https://text.baldanders.info/openpgp/gnupg-cheat-sheet/

では、鍵を生成します。

```shell
$ gpg --full-gen-key --expert
```

RSA and RSAを選択します。有効期限は1yです。
生成が完了したら、以下のようにして正しく生成されたことを確認します。

```shell
$ gpg -k | tail -n5
pub   rsa2048 2019-12-05 [SC] [expires: 2020-12-04]
      6EA9974F9C2F03106BDE84F6160D8704EFA2F6D0
uid           [ultimate] onokatio (also onokatio@gmail.com and onokatio@katio.net is available) <onokatio@protonmail.com>
sub   rsa2048 2019-12-05 [E] [expires: 2020-12-04]
```

これで、master key1つとsubkey 1つが生成されました。また、`~/.gnupg/openpgp-revocs.d/`以下に失効証明書が作成されているのでどこかに保管しておきましょう。

また、以下のyubikeyの手順に沿って一応認証用のsubkeyも追加しておきます。
https://developers.yubico.com/PGP/Importing_keys.html

## Yubikeyで鍵のインポート

次に、鍵をyubikeyへインポートします。まずスロットを選びましょう。

以下、自分の過去ブログ記事より抜粋です。

- YubikeyのPIVには、9a 9c 9d 9eの計4つの「スロット」があります。 つまり、4つの秘密鍵を保管することができます。
- YubikeyのPIV鍵は、PINコードで保護されており、PINコードを入力しないとYubikeyに物理的にアクセスできても使うことはできません。
- 9a 9c 9d 9eの各スロットは、もともとは利用目的があるため、微妙にPINコードの管理が異なります。 9aと9dは、認証に使うため（パソコンにセットするとか）に作られたため、一度PINコードを入力するとUSB接続が切れるまで使えます。 9cはファイルのデジタル署名に使うため、署名するたびにPINコードが必要になります。 9eは、建物の入館時のドアロックの解除などに使うため、PINコードが必要ありません。 まーーー我々は連邦職員じゃないので、好きなスロット使えば良いですね。

抜粋ここまで。ということで、一番セキュリティレベルが高い9cを利用します。

yubikeyを指した状態で、以下を実行します。

```
$ gpg --expert --edit-key KEYID

> toggle
> keytocard
```


==お知らせ==

ここで、3時間ほどyubikeyと格闘しましたが、うまく鍵が保管できなかったため、一旦yubikeyのことは忘れます。

ひとまず、これで鍵生成ができました。

# 鍵サーバーへの登録

鍵を鍵サーバーへ登録します。

```
$ gpg --send-keys
```

# SSHでの仕様

gpg鍵を、SSHの鍵として使用できます。そのためには、ssh-agentをgpg-agentにすり替える必要があります。

Archwikiを元に、`bashrc`を以下のように編集します。


```
unset SSH_AGENT_PID
if [ "${gnupg_SSH_AUTH_SOCK_by:-0}" -ne $$ ]; then
  export SSH_AUTH_SOCK="$(gpgconf --list-dirs agent-ssh-socket)"
fi
```

すると、`ssh-add -L`でgpg鍵が見れるようですが‥何故か見れない

# gitで使う

gitで、configに鍵の設定を追加します。

```
$ git config user.signingkey KEY
```

するとgit commit実行時に署名付きコミットが‥できませんね。うーん、なんでだろう。

# まとめ

ちょっと不完全な結果になってしまったので、また明日検証します。
