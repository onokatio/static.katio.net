---
title: Solidityチートシート
tags: Blockchain Ethereum solidity チートシート
author: onokatio
slide: false
---
Ethereumでスマートコントラクトを生成するための言語であるSolidityのチートシートです。
毎回英wiki行くの疲れたので適宜日本語でいい感じに書きます。
基本的には最新の安定バージョンに追随するつもりですが、多忙を極めると更新しなくなると思います。
そのため以下に対応した最新のSolidityのバージョンを表記します。

---
> Solidity: 0.4.19

---
# 演算子

式などでの比較は暗黙的にbooleanとしてみなされます。
0で割ると例外で怒られます。
シフトされる数が負の数の場合、拡張されます。（符号変わらず絶対値がシフトされる）
シフトする数が負の数の場合、例外が投げられます。
また、シフトは内部的には`x * 2**y`や`x / 2**y`として計算されるので他の言語とは少し挙動が異なります。
論理演算子は短絡が有効です。つまり、`a() && b()`や`a() || b()`をif文がわりに使うアレが使えます。

### 計算(数値型)
 `+` `-` `*` `/` `**`(べき乗) `%`

### ビット演算子(数値型)
`&` `|` `^`（xor） `~`（ビット反転） `<<` `>>`

### 比較(数値型,アドレス型)
`<=` `<` `==` `>` `>=`

### 論理演算子(真偽値型)
`!` `&&` `||` `==` `!=`

### 計算代入
`+=` `-=` `*=` `/=` `%=` `|=` `&=` `^=` `a++` `a--` `++a` `--a`

# 値

通常通り数字で10進数、英数字と`0x`で16進数を表せます。
小数点`.`より上の桁を省略した場合、`0.`とみなされます。(`.1` と `0.1`は等価)
address型について、桁数が39〜41桁で、かつチェックサムに通るものだけがアドレス型として扱われます。そうでない場合にはエラーが出ます。
数値は、科学表記が可能です。（例: `2e10`）
また、除算の際にあまりが出た場合、小数が変えるようになっています。（`5/2`は`2`ではなく`2.5`）
ダブルクォートで囲まれた文字列は、UTF-8の16進数コードに置き換えられます。C言語のように`\0`は末尾につかないので、`"foo"`は4バイトではなく3バイトになります。
また、文字列は`\n` `\xNN` `\uNNNN` `\xNN`などのエスケープシークエンスを使うことができます。


# 変数

### 変数宣言

基本的に、`型名 修飾子 変数名`の順番です。
constantを付けることで定数を定義できます。
修飾子の一つに、memoryとstorageが選択できます。memoryはEVM内で完結される一時変数、storageはブロックチェーンに保管される変数です。

```Solidity
int8 num;
uint memory abc = 3;
```

また、変数の型の推測をさせることができます。
そうしたい場合は型名を`var`と指定します。

```:例
var a = 0x123;
// aは`uint24`型となります。
```

### 変数開放

変数は、開放することができます。保存領域が高価なEthereumにとって、これは大事です。

- delete

```:例
uint a;
delete a;
```

### 真偽値型

trueとfalseの2種類を保管できます。

- bool

```c:例
bool flag = true;
```

### 数値型

数値型です。intが整数、uintが自然数（unsigned）です。
各型には大きさが指定でき、8bitから256bitまで8ずつ増えていきます。（uint16,uint24,uint32 ...）
大きさを指定しなかった場合、256になります。(int = int256)

- int8 - int256
- uint8 - uint256

```c:例
int a;
uintn8 b;
uint256 c = 5;
```

### 固定小数点数型

※固定小数点数型は、Solidityではほとんどサポートされてません。（うまく翻訳できなかったのでどこからどこまでサポートされてるのかわかる方は教えてください。）

小数型です。小数点の位置は固定されます。fixedが小数、ufixedが0より大きい小数です。
MとNの２つで指定します。Mは整数型と同じ変数のサイズです。8から256まで選択できます。
Nは小数点以下が何ビットかを指定します。
MとNをを省略したfixed、ufixedはそれぞれ`ufixed128x19`と`fixed128x19`の意味を持ちます。

- fixedMxN
- ufixedMxN

```c:例
fixed a;
ufixed32x8 b;
ufixed256x19 c = 1.0;
```

### アドレス型

Ethereumでのアドレスを保管できる型です。20バイトくらいで英数字がはいってるアレ。

- address

また、address型はメソッドを持っています。
balanceは数値型でアドレスの残高を返します。transferは数値型の引数をもち、自分のアドレスからtransferメソッドを持つアドレスへ数値分のETHを送金できます。
もしコントラクトの実行中にgas不足で実行が停止した場合、そこまでに実行されたtransferは取り消しされます。
sendはtransferの下位版です。sendはtransferと違って返り値があります。送金に失敗したらfalseを返します。transferはコールスタックの深さが1024以上だとエラーになります。
sendとtransferの違いがうまくわからないのでわかる人おしえてください！

- function balance() returns(uint)
- function transfer(uint) returns(void)
- function send(uint) returns(bool)

```c:例
address x = 0x123;
address myAddress = this;
if (x.balance < 10 && myAddress.balance >= 10) x.transfer(10);
```

この例では、0x123のアドレスの残高が10未満で、自分の残高が10以上の場合。自分から0x123に10ETH送金します。
また、callメソッドもあります。これは別のコントラクトの関数を実行することができます。第一引数が文字列型で関数名となっています。callの第二引数から後ろは、数も型も指定されておらず、自由に呼び出したい関数に引数を与えることができます。第二引数から後ろは、それぞれ32バイトにまとめられ連結されます。32バイト以上引数があって、まとめられるのが嫌な場合、関数名とその引数の型を文字列にして、keccak256でハッシュをし、その先頭4バイトだけを第一引数にすることができるらしいですが、自分はよくわかっていないので教えてください。

delegatecallについては、呼び出し先の関数の機能だけを利用し、内部的なstorageの変更などは全部現在のコントラクトで行います。これはライブラリとして外部の関数を使いたいときに便利です。

また、callcodeというメソッドもあるようですが、今後削除予定らしいです。

- function call(any) returns(void)
- function callcode(any) returns(void)
- function delegatecall ???

```:例
address nameReg = 0x72ba7d8e73fe8eb666ea66babc8116a41bfb10e2;
nameReg.call("register", "MyName");
nameReg.call(bytes4(keccak256("fun(uint256)")), a);
```

例では、単純なキーバリューストアであるコントラクトの名前を登録する関数を呼び出しています。
また、callには更にメソッドがあり、呼び出しを細かく指定できます。
call.gasで呼び出し先コントラクトが使用していいgasの制限、valueで一緒に送金する額を指定できます。両方指定したい場合はgasのメソッドとしさらにvalueを指定し、最後に引数を並べてください。

```:例
namReg.call.gas(1000000)("register", "MyName");
nameReg.call.value(1 ether)("register", "MyName");
nameReg.call.gas(1000000).value(1 ether)("register", "MyName");
```

### 固定長任意型

任意の値をなんでも保管できる。（らしいです）
サイズをbytesNのNで指定できます。Nはbytes1からbytes32まで1刻みであります(bytes1,byres2,bytes3...)。
byteを指定するとbytes1としてみなされます。
これは主にバイナリや文字コードなどを保管する用らしいです。

- bytes1 - byte32

### 配列

配列です。宣言時に型名の後ろに`[20]`などを付けるだけで生成できます。
配列の要素は`[]`を使って読み書きできます。
また、配列の`.length`を読むことで配列の大きさを取得できます。
多重配列を作ることも可能です。

```c:例
uint[10] array;
array[0] = 1;
array[1] = array.length; // array[1] = 10;
```

### 動的配列

動的配列です。宣言時に配列の要素の数を指定せず、あとからいくらでも追加することができます。
それ以外は配列とほとんど変わりません。
動的配列でも、多重配列を作ることができます。
動的配列にも`.length`があります。また、`push`というメソッドも持っています。

- function push(anyvalue) returns(void)

pushを使うことで、動的配列の最後尾に要素を追加することができます。

```:例
uint[] array;
array[0] = 1;
array.push(10); // array[array.length] = 10
```

### 任意型

固定長任意型がありましたが、要素が未定（動的）な任意型もあります。固定長任意型(bytes1,bytes2)と名前は似ていますが、別のものです。
これは大きなバイナリデータなどを保管することができます。
`bytes`は、`byte[]`と意味的には変わりません。`byte[]`は、`bytes1[]`のことであり、1バイトの大きさの固定長任意型を動的配列にしたものです。
どちらも大量のバイナリを保管できますが、こちらの任意型のほうが物理的に消費される容量が少ないため、`byte[]`よりも`bytes`を使うことが推奨されています。

- bytes

```c:例
bytes raw;
raw = 0x1234567890abcde;
```

### 文字列型

文字列型は、任意の長さの文字列を保存することができます。任意型`bytes`でも同じように文字列を保存することはできるのですが、`string`にした場合、`.length`が使えなくなり、また`[]`を使った特定の要素へのアクセスができなくなります。安全、明確に文字列を格納することができます。

- string

```c:例
string str;
str = "hello world !";
```

### 構造体

構造体は、複数の型の変数を内包して新しい型を作ることができます。

- struct

```:例
struct Person {
  uint8 age;
  string name;
}

Person Tom;
Tom.age = 20;
```

### 列挙体

列挙体は、複数の定数を順序ある数値として扱えます。

- enum

```:例
enum ActionChoices { GoLeft, GoRight, GoStraight, SitStill }
ActionChoices choice;
choice = ActionChoices.GoStraight;
```

### ハッシュテーブル

ハッシュテーブルを作成することができます。ハッシュテーブルは、簡単に言えば「キー」と「値」を紐付けるデータ構造の中でも、キーに様々な型を使うことができます。
たとえば配列では、自然数でしか要素にアクセスすることができません。ですが、ハッシュテーブルではどんな型ででも要素にアクセスできます。
たとえば文字列型をキーにした場合、文字列でデータの要素を指定できます。
これを使うことで、数値型以外の好きな型でキーを指定して配列を扱うことができます。

- mapping

```:例
mapping(address => uint) balances;
balance[0x00001234abcd] = 100;

mapping(string => uint) userID;
userID["Tom"] = 1;

mapping(string => string) alias;
alias['ls'] = "ls -al";
```

----
----
# 以下工事中

# 関数

### 関数宣言

```:例
function (<parameter types>) {internal|external|private|public} [pure|constant|view|payable] [returns (<return types>)]
```

関数宣言は、上の様になっています。

` {internal|external|}`

これは、関数を外部から呼び出せるかどうかを指定できます。みたいなものです。
外部のコントラクトからcallされた場合に、internalの場合はエラーが起こります。
省略すると`public`になります。

` [pure|constant|view|payable]`

>pure for functions: Disallows modification or access of state - this is not enforced yet.
view for functions: Disallows modification of state - this is not enforced yet.
payable for functions: Allows them to receive Ether together with a call.
constant for state variables: Disallows assignment (except initialisation), does not occupy storage slot.
constant for functions: Same as view.
anonymous for events: Does not store event signature as topic.
indexed for event parameters: Stores the parameter as topic.

constant = view (getter)
### 返り値

returns
var (x, b, y) = f();
(x, y) = (2, 7);

### 引数

value call

# 制御構文

if、else、while、do、for、break、continue、return

※switchとgotoはない[

# 定数

>block.blockhash(uint blockNumber) returns (bytes32): hash of the given block - only works for 256 most recent blocks
block.coinbase (address): current block miner’s address
block.difficulty (uint): current block difficulty
block.gaslimit (uint): current block gaslimit
block.number (uint): current block number
block.timestamp (uint): current block timestamp
msg.data (bytes): complete calldata
msg.gas (uint): remaining gas
msg.sender (address): sender of the message (current call)
msg.value (uint): number of wei sent with the message
now (uint): current block timestamp (alias for block.timestamp)
tx.gasprice (uint): gas price of the transaction
tx.origin (address): sender of the transaction (full call chain)
assert(bool condition): abort execution and revert state changes if condition is false (use for internal error)
require(bool condition): abort execution and revert state changes if condition is false (use for malformed input or error in external component)
revert(): abort execution and revert state changes
keccak256(...) returns (bytes32): compute the Ethereum-SHA-3 (Keccak-256) hash of the (tightly packed) arguments
sha3(...) returns (bytes32): an alias to keccak256
sha256(...) returns (bytes32): compute the SHA-256 hash of the (tightly packed) arguments
ripemd160(...) returns (bytes20): compute the RIPEMD-160 hash of the (tightly packed) arguments
ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address): recover address associated with the public key from elliptic curve signature, return zero on error
addmod(uint x, uint y, uint k) returns (uint): compute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256
mulmod(uint x, uint y, uint k) returns (uint): compute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256
this (current contract’s type): the current contract, explicitly convertible to address
super: the contract one level higher in the inheritance hierarchy
selfdestruct(address recipient): destroy the current contract, sending its funds to the given address
suicide(address recipient): an alias to selfdestruct
<address>.balance (uint256): balance of the Address in Wei
<address>.send(uint256 amount) returns (bool): send given amount of Wei to Address, returns false on failure
<address>.transfer(uint256 amount): send given amount of Wei to Address, throws on failure

# 予約語
abstract, after, case, catch, default, final, in, inline, let, match, null, of, relocatable, static, switch, try, type, typeof
# 抽象コントラクト
# インターフェース
# ライブラリ
# Using
# データの場所と参照
# インラインアセンブリ
# Event

