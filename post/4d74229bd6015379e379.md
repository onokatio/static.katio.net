---
title: Solidityで文字列連結
tags: Blockchain Ethereum solidity
author: onokatio
slide: false
---
どうも。
今回、Solidityで文字列連結をしている方がいらっしゃったのですが（下記リンク）、ライブラリを使っていたため、自力でなんとか実装できないかと挑戦してみました。

>  [Solidityの文字列結合
](https://qiita.com/bellbelljp/items/f6f3f17f28c1251d6725) @bellbelljp さんの記事

## 実装

```js:MyStringTest.sol
pragma solidity ^0.4.19;

contract MyStringTest {

    function strConnect() public constant returns(string){
        
        string memory str1 = "abc";
        string memory str2 = "def";
        bytes memory strbyte1 = bytes(str1);
        bytes memory strbyte2 = bytes(str2);
        
        bytes memory str = new bytes(strbyte1.length + strbyte2.length);
        
        uint8 point = 0;
        
        for(uint8 j = 0; j < strbyte1.length;j++){
            str[point] = strbyte1[j];
            point++;
        }
        for(uint8 k = 0; k < strbyte2.length;k++){
            str[point] = strbyte2[k];
            point++;
        }
        return string(str);
    }
}
```

一行ずつ見ていきましょう。


```js
string memory str1 = "abc";
string memory str2 = "def";

bytes memory strbyte1 = bytes(str1);
bytes memory strbyte2 = bytes(str2);
```

まずここで、"abc"という文字列と"def"という文字列をそれぞれstr1とstr2という変数に代入しています。
そしてその後、string型をbytes型に変換しています。
string型とbytes型は、基本的には同じことができるのですが、string型には`.length`メンバがなかったり、添字を使えなかったりなどと、文字列連結をする上で不便な点があります。なので変換をしています。

```js
bytes memory str = new bytes(strbyte1.length + strbyte2.length);
```

次に、bytes型のstrという変数を作っています。bytesは動的配列なので、ここで`new`句を使ってそれぞれ文字数文のバイトを確保しています。mallocみたいなもんですね。

```js
uint8 point = 0;

for(uint8 j = 0; j < strbyte1.length;j++){
    str[point] = strbyte1[j];
    point++;
}
for(uint8 k = 0; k < strbyte2.length;k++){
    str[point] = strbyte2[k];
    point++;
}
```

次は、実際の文字列連結です。strのpoint番目の配列、つまりpointバイトの場所に、それぞれstrbyte1とstrbyte2の文字を一文字ずつコピーしていきます。正確に言うと参照のコピーになるのかな…？
あんまりEthereumのポインタがわかっていないのでそこはよくわかりません。
とりあえずこれでstrに連結した文字が代入されました。

```js
return string(str);
```

最後に、bytes型をstring型に直して値を返しています。

----


以上、無茶がありましたが結構簡単に実装できました。ちなみに、Solidityの文字列連結のライブラリでは、Library句を使ってstring型自体に文字列連結のメソッドを追加しているようです。興味があったら調べてみてください。

また、今回のコードは、連結する変数が2つと固定していることもあり、あまり汎用的ではありません。
文字列型の配列に、それぞれ文字列を代入して、最後に全部を連結する、なんて実装の仕方をすればもう少し綺麗になると思います。が、今回の記事はそこまで求めていないので妥協しました…。

最後まで閲覧いただき、ありがとうございました！

