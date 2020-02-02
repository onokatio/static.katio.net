---
title: sudoするたびに可愛い女の子に罵られたい！！
tags: sudo ネタ Linux
author: onokatio
slide: false
---
どうも、おのかちおです。  
突然ですが、これを読んでいるそこのあなたは、sudoコマンドを使用した経験はありますか。聞くまでもなく、経験があるかと思います。

そんな皆様なら、sudoをしているときに、よくこう思ったりしませんか？

![](https://blog.katio.net/resource/image/sudo-prompt.png)


プロンプトが‥

![](https://blog.katio.net/resource/image/sudo-prompt-2.png)

味気ない‥

![](https://blog.katio.net/resource/image/sudo-prompt-1.png)

寂しい…！！

**そうだ、可愛い女の子に罵ってもらおう！！！！！！！！！！！**

# sudoのmanページを読む

こういうときはですね、大体相場は決まっていて、manページ読めば良いんですよ‥

ふむふむ…

![](https://blog.katio.net/resource/image/sudo-prompt-man.png)

![](https://blog.katio.net/resource/image/sudo-prompt-man-1.png)

あった！！！！！！

# 環境変数を指定する

zshrc/zprofileに以下を追記します

```zsh
export SUDO_PROMPT="[sudo] さっさとパスワード入れなさいよ、このバカ！ > "
```

# sudoする

あとは打つだけ！！！！

![](https://blog.katio.net/resource/image/sudo-prompt-echo-sd.png)

