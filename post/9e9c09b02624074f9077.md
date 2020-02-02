---
title: Mediawikiを構築したのにセッションのエラーで自分でログインできないとき
tags: Linux mediawiki
author: onokatio
slide: false
---
どうも、はまったので書きます。

Mediawikiをさっそく設定・構築完了し、はじめに作成した自分のアカウントでログインしようとすると、以下のようなメッセージが出ました。

>ログインのセッションに問題が発生しました。 セッション乗っ取りを防ぐため、操作を取り消しました。 前のページへ戻って再度読み込んだ後に、もう一度試してください。

ブラウザのクッキーを消してみたり、phpが動作するサーバーの`/var/lib/php5/sessions`のパーミッションを変更しましたが、それでもうまく動きません。そこで出会ったのが以下のページでした。

https://www.mediawiki.org/wiki/Topic:T7irqyk4rhfy3ohk

ようするに、`LocalSettings.php`の`$wgMainCacheType`を以下のように変更すればいいみたいです。

```php:LocalSettings.php
$wgMainCacheType = CACHE_ACCEL; //これを

$wgMainCacheType = CACHE_ANYTHING; //こうする
```

これでやっと動きました。一安心…。
ちなみに原因を調べてみたところ、セッションとクッキーをAPCuでキャッシュする関係でこうなったみたいです。

