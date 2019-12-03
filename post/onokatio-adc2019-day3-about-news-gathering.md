---
title: "普段の情報収集に使っているツールについて"
date: 2019-12-03 22:59:00 +0900
---

普段の情報収集に使っているツールについて
===

この記事は [onokatio Advent Calendar 2019](https://blog.katio.net/adventcalendar/2019/onokatio) 3日目の記事です。

アドベントカレンダー 2日目の記事がちょっと重めだったので、本日の記事は軽めです。

# 情報収集について

自分は、技術分野やニュース、話題などを追いかけるために、複数のツールを利用しています。
以下にツールと対象を示します。

- RSSリーダー (IT系ニュース、ガジェット系ニュース、技術ブログ)
- Twitter (新聞・テレビ報道各社リスト)
- その他個別に見ているサイト
  - https://www.xda-developers.com/
  - https://qiita.com

# RSSリーダー

主な情報はRSSリーダーで収集しています。  
使用しているのは、[inoreader](https://jp.inoreader.com/)と呼ばれる無料サイトです。

さて、OPMLファイルから雑にxq(xml用のjq)でどんなサイトを登録しているか抽出してきました。

### ガジェット系

```shell
$ cat Inoreader\ Subscriptions\ 20191203.xml | xq '.opml.body.outline[2].outline[]["@text"] ' 
"gori.me（ゴリミー）"
"BUZZAP！（バザップ！）BUZZAP！（バザップ！）"
"Gadgets (latest) :: Kicktraq"
"ROOMIE（ルーミー）"
"＆GP"
"DIY Electronics (latest) :: Kicktraq"
"AV Watch"
"Techable（テッカブル） -海外・国内のネットベンチャー系ニュースサイト"
"Hardware (latest) :: Kicktraq"
"ITmedia ガジェット 最新記事一覧"
"geared"
"ITmedia PC USER 最新記事一覧"
"juggly.cn"
"makuake"
"ガジェット通信 デジタル・IT"
"ギズモード・ジャパン"
"pasoju(パソ充)"
"WIRED.jp最新情報 Feed – WIRED.jp"
"Engadget Japanese RSS Feed"
"物欲ガジェット.com"
"9to5Google"
```

### IT系

```shell
$ cat Inoreader\ Subscriptions\ 20191203.xml | xq '.opml.body.outline[3].outline[]["@text"] '
"TechCrunch Japan » TechCrunch"
"窓の杜"
"ライフハッカー［日本版］"
"CNET Japan 最新情報　総合"
"男子ハック"
"白ペンギン"
"Publickey"
"OSDN Magazine"
"ZDNet Japan 最新情報　総合"
"GIGAZINE"
"Mogura VR"
```

### ブロックチェーン関係

```shell
$ cat Inoreader\ Subscriptions\ 20191203.xml | xq '.opml.body.outline[4].outline[]["@text"] '
"Develop with pleasure!"
"The Coffee Times"
"イーサリアム・ジャパン"
"Ethereumタグが付けられた新着投稿 - Qiita"
"ZOOM | ブロックチェーンと仮想通貨の情報サイト"
```

大体以上が自分の購読カテゴリとサイトです。これらは、ブラウザ上でこのように表示されます。

![](https://static.katio.net/image/Inoreader0.png)

![](https://static.katio.net/image/Inoreader1.png)

一日大体100〜200記事が流れてくるので、タイトルだけを見て、面白そうな記事があればそのサイトへ飛んでいって中身を読む、というのが普段の流れです。

Inoreaderについては、色々と機能に不満があり、今後自力のRSSリーダーを作成するアイデアも練っています。好うご期待です。

# Twitter

Twitterリストに関してはあまり見ておらず、補助的な意味合いが強いです。

![](https://static.katio.net/image/Twitter-news.png)

名前が災害情報なのは、台風で帰宅困難になった当時に作成した名残のためです。

あまり確認しませんが、特段暇だったり追いたいニュースがある場合にリストを監視します。

# その他個別に見ているサイト

## XDA Developers https://www.xda-developers.com/

XDAは、Androidの開発関係のエンジニアが集うフォーラムです。ニュース編集部が存在するため、定期的に確認しています。

## Qiita https://qiita.com

皆さんご存知のQiitaです。低い頻度で、トップの記事を読んでいます。


# まとめ

自分がガジェット好きな点、最新技術を追いたいという点、ニュースを見たいという点、様々な自分の中での要望を満たすために、最終的にはRSSリーダーにすべてを突っ込み目grepする、という形に至りました。おそらく自分が知る中で大量の記事を読み続ける一番良い方法ではないかと思っています。

ここまで読んで頂きありがとうございました。もしお役に立てたのならば何よりです。
最後に、出力したOPMLファイルへのリンクを置いておきます。

https://github.com/onokatio/static.katio.net/blob/master/other/Inoreader-Subscriptions-20191203.xml
