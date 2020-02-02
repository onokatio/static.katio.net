---
title: サーバー建てずに無料で独自ドメインのメルアドを作って、Gmail(Inbox).comで送受信できるようにしてみた
tags: mailgun gmail inbox mail
author: onokatio
slide: false
---
あれじゃん、独自ドメインのメールアドレスってエンジニアの夢じゃん。

ということで、どうも、かちおです。今回は、表題の通り、サーバーを自分で建てずに無料のサービスだけをつかって、独自ドメインのメールアドレスを使えるようにしてみました。ちなみに独自ドメイン自体は用意してある必要があるので、そこを考えれば無料とは言わないかも…。

# 前提

自分は独自ドメインの [kati0.com](http://kati0.com) をもともと持っていて、今回はkati0@kati0.comというメールアドレスを作りたいと思います。
最終的に、SMTP認証をしてGmail.comからそのメールアドレスで受信したメールを確認します。

# つかったサービス

- Gmail
- Mailgun
- Cloudflare(DNSサーバーがわり)

# 受信編

Mailgunという、サーバーレスでメール配信できるSaaSサービスがあるので登録します。
登録→独自ドメインを設定→自分のDNSのメールの設定を追加、という流れになります。

https://www.mailgun.com/

いい感じにアカウントを登録してください。登録するメールアドレスは自分の個人のモノ（普段つかっているもの）で登録してください。ぼくの場合はgmailを使いました。

アカウントを登録したら、以下からドメインの登録をしてください。

https://app.mailgun.com/app/domains/new

自分の場合はkati0.comを入力しました。


ADD DOMAINを押すと、

- Add DNS Records For Sending
- Add DNS Records For Tracking

の2つが出てくるので、指定されたとおりに自分のDNSに登録しましょう。
ぼくの場合にはメインのDNSにCloudflareをつかっていたので、そこの画面で登録しました。

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/f5ce9bf5-4798-881b-8c3b-72091ada1001.png)

|Type|Name(例)|Value(例)|
|:-:|:-:|:-:|
|TXT|kati0.com|v=spf1 include:mailgun.org ~all|
|TXT|pic._domainkey.kati0.com|k=rsa; p=NAC4m<省略>|
|MX|kati0.com|mxa.mailgun.org (priority=10)|
|MX|kati0.com|mxb.mailgun.org (priority=10)|
|CNAME|mail.kati0.com|mailgun.org|

全部設定し終わったらContinue to Domain Overviewを押します。

そうするとmailgunがDNSをチェックします。Check DNS Records Nowを押すと手動更新できます。
だいたい自分の場合は、Cloudflareで設定したDNS情報がmailgunに伝搬するまで5分ほどかかりました。コーヒーでも飲みましょう。

mailgunのほうでDNSの確認をし終わると、レコードの行の左にチェックマークがつきます。

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/43467bb1-6b1b-f7e4-d669-da9f9816ae00.png)

全部の行にチェックマークが付けばDNSの設定は終わりです、Mailgunから独自ドメインでメール送信をする準備ができました。

次に、メール転送の設定をします。以下のページを開くか、メニューからRouteを選んでください。

https://app.mailgun.com/app/routes

Create Routeを押して、以下のように設定してください。

|欄|値|例(自分の場合)|
|:-:|:-:|:-:|
|Expression Type|Match Recipient|
|Recipient|match_recipient("メールを受信したい独自ドメインのメールアドレス")|match_recipient("kati0@kati0.com")	
|ActionsのForward|チェック|
|ActionsのForwardの下の欄|forward("自分が普段つかっているGmailのアドレス")|forward("onokatio@gmail.com")|
|Description|自分のわかりやすい説明。|gmail forward|

これで、kait0@kati0.comに送ったメールがGmailの画面に届くようになりました。
無料だけならば。これで独自ドメインでのメール受信が完了です。
また、クレジットカードさえ登録できれば次の章である送信もできるようになります。
ぼくはめんどくさいので独自ドメインで受け取ったメールをそのままgmailで返信していますが、興味がある方は以下もやってみてください。

# 送信編

ここからは送信の設定です。アカウントにクレジットカード（デビッドカード）を登録してある必要があります。

まず、メールアドレスを追加します。上のDomain infromationの欄にManage SMTP credentialsというリンクがあるので押してください。

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/103c73bc-e4bb-383c-0619-80e437962859.png)

自分の場合は既に登録してありますが気にしないでください。
New SMTP Credentialというところを押して、以下のように設定してください、

|名前|入力する値|例（自分の場合）|
|:-:|:-:|:-:|
|login欄|自分の設定したいメールアドレスの@前|kati0|
|Password欄|自分の好きなパスワード|●●●●|
|Confirm Password欄|パスワードをもう一回|●●●●|

これで、ユーザー名@独自ドメイン という形式のメールアドレスを作ることができました。

次に、Gmailからメールを送信するための設定をします。
Gmailを開き、右上の歯車マークから「設定」→「アカウントとインポート」に進みます。
「名前：」とある欄の「他のメールアドレスを追加」を押してください。

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/3dfd2a86-ff4d-f0f8-f945-47928927797f.png)

※画像では既に登録してますが気にしないでください。

そうすると、ポップアップウィンドウが開くので、以下のように入力してください。

| 項目 | 値 |
|:-:|:-:|
| 名前 | 適当な名前 |
| メールアドレス | さきほど作ったメールアドレス(kati0@kati0.comなど) |
| エイリアスとして扱います | チェック |

そして、次のステップに進み、以下のように入力してください。

| 項目 | 値 |
|:-:|:-:|
| SMTPサーバー | デフォルトの値(mxb.mailgun.org) |
| ユーザー名 | さきほど作ったメールアドレス(kati0@kati0.comなど) |
| パスワード | さきほど設定したパスワード |
| ポート | 587のままでOK |

以上が設定できたら、アカウント追加をクリックしてください。Googleから独自ドメインのメールアドレス宛に、本当にGmailから操作していいか確認メールが届きます。既に受信だけはできるようになっているので、Gmailを更新すればメールを確認できると思います。メールに書いてある確認番号をポップアップウィンドウに入力してください。以上でアカウントを登録できます。

これで送信の設定は完了です。Gmailから送信するときに、送信フォームの上にメールアドレスを選択する場所ができ、そこで独自ドメインのメールアドレスを指定できます。

# まとめ

独自ドメインっていいよね！！！（語彙力）

