---
title: "Verilog-HDLで32bit ALUを作った話"
date: 2019-12-01 03:08:00 +0900
---

Verilog-HDLで32bit ALUを作った話
===

どうも、こんにちは。  
木更津高専Advent Calendar 2019一日目担当です。このアドベントカレンダーの発起人です。

どうせなら学校に関係ある話題を書こうかな、という次第ですので、今回は学校の課題で作成した32bit ALUについて書いていきたいと思います。

# 木更津高専情報工学科電子計算機 Ⅲ

弊学では（弊学ってよく使うんですけどこの日本が正しいかどうか知らない）、情報工学科4年生の後期に電子計算機Ⅲという科目名の授業があります。  
半年書けて、Full Adder(全加算器)、Arithmetic Logic Unit(ALU, 演算ロジック装置?)を作成することが目標です。

毎年、紙やKiCad、Verilog-HDLなどで論理回路図、回路図、実体配線図を設計し、ブレッドボードやユニバーサル基板、最近だと基板加工機でプリント基板を作成等してALUを組み立てます。

どうせなら勉強のためにVerilog-HDLを書こう、と思い自分はVerilogですべての素子を設計しました。

# ALUについて

ALUは、加減算(`+`,`-`)、論理演算(AND, OR, XOR, NOT XOR)を計算できる素子です。  
一般的に、1bit ALUは以下の端子を持ちます。

- 入力ビット - 3bit
  - 演算子の左の値 - 1bit
  - 演算子の右の値 - 1bit
  - 下の桁のALUからの繰り上がり - 1bit
- 出力ビット - 2bit
  - 計算結果 - 1bit
  - 上の桁のALUへの繰り上がり - 1bit

- 計算モード切り替え - 3bit程度

1bit ALUはn bit ALUとして接続することを前提としているため、繰り上がり用のピンが存在します。もちろん、繰り上がりが発生するのは加減算の場合のみです。

また、計算モード切り替えについては、7種類の計算を3bitで表現します。内部的には8bitにデコードされるので最初から8bitでも構いません。

> - デコードとは  
> 
> デコードは、2進数の組み合わせで表現された値を、特定のビットだけが立った2進数に変換する操作です。  
> 
> 例えば`001`をデコードすると`00000100`、  
> 011だと`00001000`、  
> 101だと`01000000`になります。
> 

# 今回の前提

- 1bit ALUを32個組み合わせ、32bit ALUを作る
- すべての素子はNAND ICのみで作成する。
- 作るのはブロック図(RTL図)までで、回路図までは作らない

# 素子

まずは、最低限の論理回路を作るために、基本素子が必要になります。NANDだけで基本素子を作りましょう。

## 2入力NAND

```vhdl=
module KATIO_NAND2 (
        input A, B,
        output X );

   assign X = ~(A & B);

endmodule
```

Verilog初心者なので正しいかわかりませんが、ひとまずこういった形に落ち着きました。  
内部的には、assign文で`A`と`B`をNAND(AND + NOT)し、`X`に出力しています。  
これから他の素子は、このKATIO_NAND2モジュールのみで作っていきましょう。

ちなみにNANDの真理値表は以下です。

|A|B|X|
|:-:|:-:|:-:|
|0|0|1|
|0|1|1|
|1|0|1|
|1|1|0|

## 1入力NOT

![](https://static.katio.net/image/alu/not1.png)

```vhdl=
module NOT1 (
        input A,
        output X );

        KATIO_NAND2 new_nand (A,A, X);

endmodule
```

NOTです。NOTはNANDに同じ値を入力することで作ることができます。  
ここでは、KATIO_NAND2モジュールを呼び出し、その入力に両方共`A`を与えています。

そういえばなんでNOTだけ`KATIO_`接頭辞つけてないんだろう…。まあいいや。

書く必要はなさそうだけど、NOTの真理値表は以下です。

|A|X|
|:-:|:-:|
|0|1|
|1|0|

## 2入力AND

![](https://static.katio.net/image/alu/and2.png)


```vhdl=
module KATIO_AND2 (
        input A,
        input B,
        output X );

        wire C;
        KATIO_NAND2 new_nand (A, B, C);
        NOT1 new_not (C, X);

endmodule
```

KATIO_NAND2を呼び出し、NANDしたあとにNOTしています。わざわざANDをNOTしたNANDでNOTを作る意義とは‥と思ってしまいそうですが、今回は物理的にNAND ICを使うつもりなの特に問題はありません。

また、wireというのが出てきました。これは、素子同士の入力、出力を線でつなぐことができます。文字そのままワイヤという意味です。

ANDの真理値表は以下です。

|A|B|X|
|:-:|:-:|:-:|
|0|0|0|
|0|1|0|
|1|0|0|
|1|1|1|

## 3入力AND

```vhdl=
module KATIO_AND3 (
        input A,
        input B,
        input C,
        output X );

        wire D;
        KATIO_AND2 new_and_1 (A, B, D);
        KATIO_AND2 new_and_2 (C, D, X);

endmodule
```

ANDを2回使って3入力ANDを作っています。

|A|B|C|X|
|:-:|:-:|:-:|:-:|
|0|0|0|0|
|0|0|1|0|
|0|1|0|0|
|0|1|1|0|
|1|0|0|0|
|1|0|1|0|
|1|1|0|0|
|1|1|1|1|

## 2入力OR

![](https://static.katio.net/image/alu/or2.png)

```vhdl=
module KATIO_OR2 (
        input A,
        input B,
        output X );

        wire C;
        wire D;
        NOT1 new_not_1 (A, C);
        NOT1 new_not_2 (B, D);
        KATIO_NAND2 new_nand (C, D, X);

endmodule
```

ORです。ORは、NANDの入力をNOTすることで作成できます。直感的に理解する方法としては、NANDの真理値表のXを下から呼んでいけばOR回路になること、というのが簡単だと思います。

|A|B|X|
|:-:|:-:|:-:|
|0|0|0|
|0|1|1|
|1|0|1|
|1|1|1|

## 3入力OR

![](https://static.katio.net/image/alu/or3.png)

```vhdl=
module KATIO_OR3 (
        input A,
        input B,
        input C,
        output X );

        wire D;
        KATIO_OR2 new_or_1 (A, B, D);
        KATIO_OR2 new_or_2 (D, C, X);

endmodule
```

3入力ORは、2入力ORを2つつなげただけです。0,0,0が入る場合以外すべて1を返します。

|A|B|C|X|
|:-:|:-:|:-:|:-:|
|0|0|0|0|
|0|0|1|1|
|0|1|0|1|
|0|1|1|1|
|1|0|0|1|
|1|0|1|1|
|1|1|0|1|
|1|1|1|1|

## 3入力NOR

![](https://static.katio.net/image/alu/nor3.png)


```vhdl=
module KATIO_NOR3 (
        input A,
        input B,
        input C,
        output X1 );

        KATIO_OR3 new_or (A, B, C, X0);
        NOT1 new_not (X0, X1);

endmodule
```

NORはORのNOTです。3入力NORだけあとで必要になるので作りました。

|A|B|C|X|
|:-:|:-:|:-:|:-:|
|0|0|0|1|
|0|0|1|0|
|0|1|0|0|
|0|1|1|0|
|1|0|0|0|
|1|0|1|0|
|1|1|0|0|
|1|1|1|0|

## 2入力XOR

```vhdl=
module EXOR2 (
        input A,
        input B,
        output X );

        wire C;
        wire D;
        wire E;
        KATIO_NAND2 new_nand_1 (A, B, C);
        KATIO_NAND2 new_nand_2 (A, C, D);
        KATIO_NAND2 new_nand_3 (B, C, E);
        KATIO_NAND2 new_nand_4 (D, E, X);

endmodule
```

XORは、NANDをクロスして作ることができます。どうしてこうなるんだ‥と思いましたが、まあ加法標準形書いてカルノー図ごにょごにょしたらできるんでしょう、たぶん。

|A|B|X|
|:-:|:-:|:-:|
|0|0|0|
|0|1|1|
|1|0|1|
|1|1|0|

# 半加算器

![](https://static.katio.net/image/alu/ha.png)

```vhdl=
module HA2 (
        input A,
        input B,
        output S,
        output C);

        EXOR2 new_exor (A, B, S);
        KATIO_AND2 new_and (A, B, C);

endmodule
```

半加算器です。Sには足し算の結果を、Cには繰り上がりを出力します。片方が1だと01、両方1だと01が出てくるので、XORとANDで作れるのは直感的だと思います。

|A|B|S|C|
|:-:|:-:|:-:|:-:|
|0|0|0|0|
|0|1|1|0|
|1|0|1|0|
|1|1|0|1|

# 全加算器

```vhdl=
module FA2 (
        input A,
        input B,
        input X,
        output S,
        output Co);

        wire SS;
        wire CC;
        wire CCC;

        KATIO_NAND2 new_nand_1 (A, B, C);
        KATIO_NAND2 new_nand_2 (A, C, AC);
        KATIO_NAND2 new_nand_3 (B, C, BC);
        KATIO_NAND2 new_nand_4 (AC, BC, ABC);
        KATIO_NAND2 new_nand_5 (ABC, X, ABCX);
        KATIO_NAND2 new_nand_6 (ABCX, ABC, S1);
        KATIO_NAND2 new_nand_7 (ABCX, X , S2);
        KATIO_NAND2 new_nand_8 (S1, S2 , S);
        KATIO_NAND2 new_nand_9 (ABCX, C , Co);

endmodule
```

半加算器を組み合わせて作ると思ったそこの貴方！僕も最初は同じコードを書いていたのですが、NANDで作る場合このXORを組み合わせた形が最小の数で作成できるらしいです。(wikipedia調べ)

これもおそらくごにょごにょしたらできるんでしょう。

|A|B|X|S|Co|
|:-:|:-:|:-:|:-:|:-:|
|0|0|0|0|0|
|0|0|1|1|0|
|0|1|0|1|0|
|0|1|1|0|1|
|1|0|0|1|0|
|1|0|1|0|1|
|1|1|0|0|1|
|1|1|1|1|1|

## 2入力データセレクタ

![](https://static.katio.net/image/alu/dataselector.png)

```vhdl=
module DATASELECTOR2 (
        input S,
        input A,
        input B,
        output X );

        wire SB;
        wire C;
        wire D;

        KATIO_NAND2 new_nand_1 (B, S, BS);
        KATIO_NAND2 new_nand_2 (S, S, SS);
        KATIO_NAND2 new_nand_3 (A, SS, ASS);
        KATIO_NAND2 new_nand_4 (BS, ASS, X);

endmodule
```

DSです。DSは、入力2つ(A,B)と選択用端子1つをもち、選択用端子が0ならAを、1ならBを出力します。  
やってることは簡単で、$S$と$\overline{S}$をA,BとANDしてるだけです。

|S|X|
|:-:|:-:|
|0|A|
|1|B|

↓展開後

|S|A|B|X|
|:-:|:-:|:-:|:-:|
|0|0|0|0|
|0|0|1|1|
|0|1|0|0|
|0|1|1|1|
|1|0|0|0|
|1|0|1|0|
|1|1|0|1|
|1|1|1|1|

## 3bit to 8bitデコーダー

![](https://static.katio.net/image/alu/decoder.png)

```vhdl=
module DECODER3 (
        input A,
        input B,
        input C,
        output wire [7:0] X );

        wire notA;
        wire notB;
        wire notC;

        NOT1 new_not_1 (A, notA);
        NOT1 new_not_2 (B, notB);
        NOT1 new_not_3 (C, notC);

        KATIO_AND3 new_and_0 (notA, notB, notC, X[0] );
        KATIO_AND3 new_and_1 (notA, notB,    C, X[1] );
        KATIO_AND3 new_and_2 (notA,    B, notC, X[2] );
        KATIO_AND3 new_and_3 (notA,    B,    C, X[3] );
        KATIO_AND3 new_and_4 (   A, notB, notC, X[4] );
        KATIO_AND3 new_and_5 (   A, notB,    C, X[5] );
        KATIO_AND3 new_and_6 (   A,    B, notC, X[6] );
        KATIO_AND3 new_and_7 (   A,    B,    C, X[7] );

endmodule
```

デコーダーです。内容は簡単で、ABCのANDから特定のビットを立てているだけです。  
ここで初めて配列の様な表記が出てきました。これは、バスラインのように複数のビットをまとめて一本の線として扱える記法です。添字で特定のビットにアクセスできます。

|A|B|C|X|
|:-:|:-:|:-:|:-:|
|0|0|0|00000001|
|0|0|1|00000010|
|0|1|0|00000100|
|0|1|1|00001000|
|1|0|0|00010000|
|1|0|1|00100000|
|1|1|0|01000000|
|1|1|1|10000000|

# ALUの作成

本題です。上で作った素子を使ってALUを作ります。

## ALUの設計について

実はALUは、全加算器のみで作れます。その理由は簡単で、ALUの繰り上がり入力を固定して、ALUの出力の片方に注目すると、実はAND,OR,XOR,NOT XORが出てきています。
例として、ANDを上げましょう。

$And(A,B) = FaCo(0,A,B)$

|A|B|X|Co|
|:-:|:-:|:-:|:-:|:-:|
|**0**|**0**|**0**|**0**|
|0|0|1|1|0|
|**0**|**1**|**0**|**0**|
|0|1|1|0|1|
|**1**|**0**|**0**|**0**|
|1|0|1|0|1|
|**1**|**1**|**0**|**1**|
|1|1|1|1|

FaCoは全加算器のCo出力という意味です。繰り上がり入力に0を入れてFAのCoを見ると、ABのANDが出てきます。

同じように、OR,XOR,NOT XORも以下のようにして作れます。

$And(A,B) = FaCo(0,A,B)$  
$Or(A,B) =  FaCo(1,A,B)$  
$Xor(A,B) = FaS(0,A,B)$  
$\overline{Xor}(A,B) = FaS(1,A,B)$  

## 1bit ALUの作成

おおまかなブロック図としては以下のようになります。

![](https://static.katio.net/image/alu/alu1.png)

内容としては、FAのC（下位ALUからの繰り上がり）へ、加算のときはそのまま、計算モードが2か4(or,not xor)のときは1を、それ以外は0を入力しています。

また、Faの出力を、データセレクタを用いてCoやSを選択しています。  
計算モードが1か2(and,or)の場合はCoを、そうでない場合はSをXへ出力しています。  
Coは加減算モード以外ALUの入力時に無視されるので、常にそのままC_out(上位への繰り上がり)へ出力しています。

HDLは以下です。

```vhdl=
module ALU (
        input wire [7:0] decoder_x,
        input A,
        input B,
        input C_in,
        output X,
        output C_out );

        // mode
        // 0x00 : 000 : plus
        // 0x01 : 001 : AND
        // 0x02 : 010 : OR
        // 0x03 : 011 : ExOR
        // 0x04 : 100 : Not ExOR

        KATIO_AND2 set_1_when_mode_plus (C_in, decoder_x[0], C_in2);
        KATIO_OR2  set_0_when_mode_orexorb (decoder_x[2], decoder_x[4], C_in3);
        KATIO_OR2  set_0_when_mode_calc (C_in2, C_in3, C_in4);

        FA2 new_fa (A, B, C_in4, FA_out_s, C_out);

        KATIO_OR2  out_port_check_2 (decoder_x[1], decoder_x[2], Selector);

        DATASELECTOR2 output_ds (Selector, FA_out_s, C_out, X);

endmodule
```

## 8bit, 16bit, 32bit ALUの作成

```vhdl=
module ALU8 (
        input wire [7:0] Mode,
        input [7:0] A,
        input [7:0] B,
        input C_in,
        output [7:0] X,
        output C_out);

        // mode
        // 0x00 : 000 : plus
        // 0x01 : 001 : AND
        // 0x02 : 010 : OR
        // 0x03 : 011 : ExOR
        // 0x04 : 100 : Not ExOR

        ALU alu_1 (Mode, A[0], B[0], C_in, X[0], C1);
        ALU alu_2 (Mode, A[1], B[1], C1,   X[1], C2);
        ALU alu_3 (Mode, A[2], B[2], C2,   X[2], C3);
        ALU alu_4 (Mode, A[3], B[3], C3,   X[3], C4);
        ALU alu_5 (Mode, A[4], B[4], C4,   X[4], C5);
        ALU alu_6 (Mode, A[5], B[5], C5,   X[5], C6);
        ALU alu_7 (Mode, A[6], B[6], C6,   X[6], C7);
        ALU alu_8 (Mode, A[7], B[7], C7,   X[7], C_out);
endmodule
```

```vhdl=
module ALU16 (
        input wire [7:0] Mode,
        input [15:0] A,
        input [15:0] B,
        input C_in,
        output [15:0] X,
        output C_out);

        ALU8 alu8_1 (Mode, A[7:0],  B[7:0],  C_in, X[7:0], C1);
        ALU8 alu8_2 (Mode, A[15:8], B[15:8], C1, X[15:8], C_out);
endmodule
```

```vhdl=
module ALU32 (
        input wire [7:0] Mode,
        input [31:0] A,
        input [31:0] B,
        input C_in,
        output [31:0] X,
        output C_out);

        ALU16 alu16_1 (Mode, A[15:0],  B[15:0],  C_in, X[15:0], C1);
        ALU16 alu16_2 (Mode, A[31:16], B[31:16], C1, X[31:16], C_out);
endmodule
```

やっていることは簡単で、8bitは1bit ALUを8つ、16bitは8bitを2つ、32bitは16bitを2つ使用してるだけです。

# コードのテストについて

今回、コードはすべてgithubで管理しています。  
ディレクトリ構造は以下のようになっています。

```
./library/ha2.v
./library/and3.v
./library/decoder3.v
./library/or3.v
./library/nor3.v
./library/and2.v
./library/nand2.v
./library/not1.v
./library/or2.v
./library/exor2.v
./library/dataselector2.v
./library/fa2.v
./test/test_ds.v
./test/test_2.v
./test/test_decoder.v
./test/test_alu8.v
./test/test_alu16.v
./test/test_alu32.v
./test/test_3in.v
./test/test.v
./test/test_alu.v
./Makefile
./alu_1bit.v
./alu_8bit.v
./alu_16bit.v
./alu_32bit.v
```

## テストを書く

Verilog-HDLをコンパイルし、実行するツールには`iverilog`を使いました。理由はコマンドラインから実行できてLinuxでも動作するためです。

ディレクトリ構造からもわかりますが、iverilogでテストができるように`test/`というディレクトリを作り、その直下にテスト用の回路を置いています。例えば`./test/test.v`の内容は以下の通りです。

```vhdl=
module TEST;

reg a, b;

wire [7:0] decoder_out;

KATIO_NAND2 new_nand (a, b, nand_out);
KATIO_OR2 new_or (a, b, or_out);
NOT1  new_not  (a, not_out);
EXOR2  new_exor  (a, b, exor_out);
KATIO_AND2  new_and  (a, b, and_out);

initial begin
   $dumpfile("test.vcd");
   $dumpvars(0, TEST);
   $monitor ("%t: a = %b, b = %b, nand = %b, not = %b, or = %b, exor = %b, and = %b", $time, a, b, nand_out, not_out, or_out, exor_out, and_out);

        a = 0; b = 0;
   #10  a = 1;
   #10  a = 0; b = 1;
   #10  a = 1;
   #10  $finish;
end

endmodule
```

このファイルでは、AND,OR,NOT,EXOR,AND2にaとbを総当りで与えてその結果を表示させています。  
`#10`というのは、10秒sleepする、ということです。それ以外はだいたい雰囲気でなんとなく何をしているか解ると思います。

## Makefileを書く


`iverilog`を使うように、以下のMakefileを作りました。

```makefile=
LIBRARY := library/nand2.v \
        library/not1.v \
        library/or2.v \
        library/exor2.v \
        library/and2.v \
        library/ha2.v \
        library/fa2.v \
        library/and3.v \
        library/decoder3.v \
        library/dataselector2.v \
        library/or3.v \
        library/nor3.v \
        alu_1bit.v \
        alu_8bit.v \
        alu_16bit.v \
        alu_32bit.v

TEST := test/test.vvp \
        test/test_2.vvp \
        test/test_ds.vvp \
        test/test_decoder.vvp \
        test/test_3in.vvp \
        test/test_alu.vvp
        #test/test_alu8.vvp \
        #test/test_alu16.vvp \
        #test/test_alu32.vvp

all: $(TEST)

clean:
        rm -f test/*.vvp
        rm -f *.vcd

%.vvp : $(LIBRARY) %.v
        iverilog -o $@ -s TEST $^
```

LIBRARYとTESTで、それぞれ`.v`形式のVHDLファイルを定義し、`.v` to `.vvp`ルールを作成してコンパイルしています。

## テストを実行する

`.v`をiverilogでコンパイルしてできるファイルは`.vvp`形式で、これは`vvp`コマンドで実行できます。ためしにコンパイルして`test.vvp`を実行してみましょう。
> 実際には、.vvpファイルには`#! /usr/bin/vvp`というshebangが追加されるため、実行ファイルとして実行できます。

```shell
$ make
iverilog -o test/test.vvp -s TEST library/nand2.v library/not1.v library/or2.v library/exor2.v library/and2.v library/ha2.v library/fa2.v library/and3.v library/decoder3.v library/dataselector2.v library/or3.v library/nor3.v alu_1bit.v alu_8bit.v alu_16bit.v alu_32bit.v test/test.v
iverilog -o test/test_2.vvp -s TEST library/nand2.v library/not1.v library/or2.v library/exor2.v library/and2.v library/ha2.v library/fa2.v library/and3.v library/decoder3.v library/dataselector2.v library/or3.v library/nor3.v alu_1bit.v alu_8bit.v alu_16bit.v alu_32bit.v test/test_2.v
iverilog -o test/test_ds.vvp -s TEST library/nand2.v library/not1.v library/or2.v library/exor2.v library/and2.v library/ha2.v library/fa2.v library/and3.v library/decoder3.v library/dataselector2.v library/or3.v library/nor3.v alu_1bit.v alu_8bit.v alu_16bit.v alu_32bit.v test/test_ds.v
iverilog -o test/test_decoder.vvp -s TEST library/nand2.v library/not1.v library/or2.v library/exor2.v library/and2.v library/ha2.v library/fa2.v library/and3.v library/decoder3.v library/dataselector2.v library/or3.v library/nor3.v alu_1bit.v alu_8bit.v alu_16bit.v alu_32bit.v test/test_decoder.v
iverilog -o test/test_3in.vvp -s TEST library/nand2.v library/not1.v library/or2.v library/exor2.v library/and2.v library/ha2.v library/fa2.v library/and3.v library/decoder3.v library/dataselector2.v library/or3.v library/nor3.v alu_1bit.v alu_8bit.v alu_16bit.v alu_32bit.v test/test_3in.v
iverilog -o test/test_alu.vvp -s TEST library/nand2.v library/not1.v library/or2.v library/exor2.v library/and2.v library/ha2.v library/fa2.v library/and3.v library/decoder3.v library/dataselector2.v library/or3.v library/nor3.v alu_1bit.v alu_8bit.v alu_16bit.v alu_32bit.v test/test_alu.v

$ ./test/test.vvp
VCD info: dumpfile test.vcd opened for output.
                   0: a = 0, b = 0, nand = 1, not = 1, or = 0, exor = 0, and = 0
                  10: a = 1, b = 0, nand = 1, not = 0, or = 1, exor = 1, and = 0
                  20: a = 0, b = 1, nand = 1, not = 1, or = 1, exor = 1, and = 0
                  30: a = 1, b = 1, nand = 0, not = 0, or = 1, exor = 0, and = 1
```

これで、LIBRARYを実際に動かしaとbを変えて実行した結果が見えるようになりました。結果が正しいのが見てわかります。

また、vvpファイルを実行すると、vcdファイルが生成されます。これは波形ファイルで、`gtkwave ./test.vcd`などと実行すると波形を表示できます。

![](https://static.katio.net/image/alu/gtkwave.png)


# コードをブロック図に変換する

ちょくちょく、Verilogコードがブロック図として表示されていたと思います。今回の目的は、実際の回路図を作るためにブロック図を作ることでした。ということで、ブロック図を作成します。

## quartus/alteraをインストールする

Intel製のCADツールです。30日間無償で利用できます。Java製なのでLinuxマシンでも動作しました。  
インストール方法はここでは割愛します。

## ブロック図を生成する

http://www.ee.tcu.ac.jp/lectures/fpga/

ここのサイトを参考にさせていただきました。  
quartusのインストール方法とダウンロードリンクも乗っています。

# まとめ

今回は、自分の勉強も兼ねて論理回路図をVerilog HDLのコードとして書きました。紙に書いたりCADで作るよりも、Githubで管理でき、テキストエディタで編集できるのでとても使い勝手が良いと感じました。

また、Makefileでコードをパソコンの中でシミュレーションできるのも大変ありがたかったです。あの出力テキストをパースして、文字列比較すればテストケースを書いて単体テストも作れるかなと思います。（今回は時間がなくてやりませんでした…。）

最後にブロック図を生成するときだけ、クローズドな有償ソフトが必要になってしまいましたが、Windowsであれば本来はほかにもアプリケーションがあると思います。

ということで、以上ALUを作ってみた話でした。長文にお付き合い頂きありがとうございました。