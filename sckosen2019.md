---
title: "高専セキュコン 2019 write-up"
date: 2019-11-30 13:45:00 +0900
---

高専セキュコン 2019 write-up
===

sckosen参加したのでゆるくwrite up書いていきます。  
解いた問題は以下の4つです。

- お茶をさぐれ
- 最後に消したファイル
- 名前を解決したい
- 新人エンジニアの発明

# お茶をさぐれ

Androidアプリの問題です。試しにアプリをスマホにインストールしたら、ユーザー名とパスワードのフォームがでてきました。おそらくこれに正解するとフラグが表示されるようです。

jarファイルをzipで展開したあと、dex2jarでclasses.dexを展開、jadでclassファイルをjavaソースコードまで戻しました。

で、色々中を探した結果出てきたのは`com/example/ureshino/ctfmondai_android/LoginActivity`の以下のようなコード。

```java=
            Object obj2 = new StringBuilder();
            ((StringBuilder) (obj2)).append(f());
            ((StringBuilder) (obj2)).append(l());
            ((StringBuilder) (obj2)).append(o());
            ((StringBuilder) (obj2)).append(g());
            ((StringBuilder) (obj2)).append(g2());
            ((StringBuilder) (obj2)).append(e());
            ((StringBuilder) (obj2)).append(h());
            ((StringBuilder) (obj2)).append(i());
            ((StringBuilder) (obj2)).append(j());
            ((StringBuilder) (obj2)).append(k());
            ((StringBuilder) (obj2)).append(l2());
            ((StringBuilder) (obj2)).append(n());
            ((StringBuilder) (obj2)).append(o2());
            obj2 = ((StringBuilder) (obj2)).toString();
            StringBuilder stringbuilder = new StringBuilder();
            stringbuilder.append("CTFKIT{");
            stringbuilder.append(nyaho(((String) (obj2))));
            stringbuilder.append("}");
            textview.setText(stringbuilder.toString());
            return;

```

と、あとこれ

```java=
    public String e()
    {
        return "v";
    }

    public String f()
    {
        return "h";
    }

    public String g()
    {
        return "f";
    }

    public String g2()
    {
        return "u";
    }

    public String h()
    {
        return "a";
    }

    public String i()
    {
        return "b";
    }

    public String j()
    {
        return "_";
    }

    public String k()
    {
        return "g";
    }

    public String l()
    {
        return "e";
    }

    public String l2()
    {
        return "r";
    }

    public String n()
    {
        return "n";
    }

    public String nyaho(String s)
    {
        char ac[] = new char[s.length()];
        for(int i1 = 0; i1 < s.length(); i1++)
        {
            char c1 = s.charAt(i1);
            char c;
            if(c1 >= 'a' && c1 <= 'm')
                c = (char)(c1 + 13);
            else
            if(c1 >= 'A' && c1 <= 'M')
                c = (char)(c1 + 13);
            else
            if(c1 >= 'n' && c1 <= 'z')
            {
                c = (char)(c1 - 13);
            } else
            {
                c = c1;
                if(c1 >= 'N')
                {
                    c = c1;
                    if(c1 <= 'Z')
                        c = (char)(c1 - 13);
                }
            }
            ac[i1] = c;
        }

        return String.valueOf(ac);
    }

    public String o()
    {
        return "r";
    }

    public String o2()
    {
        return "_";
    }


```

見た感じ、文字列弄ってフラグを作ってるっぽい。なので以下のようなCのコードを書いて実行します。

```cpp=
#include <stdio.h>

main()
    {
        char s[] = "herfuvab_grn_";
        char ac[100];
        for(int i1 = 0; i1 < 13; i1++)
        {
            char c1 = s[i1];
            char c;
            if(c1 >= 'a' && c1 <= 'm')
                c = (char)(c1 + 13);
            else
            if(c1 >= 'A' && c1 <= 'M')
                c = (char)(c1 + 13);
            else
            if(c1 >= 'n' && c1 <= 'z')
            {
                c = (char)(c1 - 13);
            } else
            {
                c = c1;
                if(c1 >= 'N')
                {
                    c = c1;
                    if(c1 <= 'Z')
                        c = (char)(c1 - 13);
                }
            }
            ac[i1] = c;
        }

        printf("%s", ac);
        //return String.valueOf(ac);
    }
```


で、フラグが出てくるので終わり

```
CTFKIT{ureshino_tea_}
```

# 最後に消したファイル

beelmama.7zという圧縮ファイルが渡されるので展開。beelmamaというファイルがでてきます。

fileコマンドを使うと、どうやらFAT形式のディスクイメージのよう。

```shell
$ file beelmama
beelmama: DOS/MBR boot sector, code offset 0x3c+2, OEM-ID "mkfs.fat", sectors/cluster 4, reserved sectors 4, root entries 512, Media descriptor 0xf8, sectors/FAT 100, sectors/track 32, heads 64, hidden sectors 2048, sectors 102400 (volumes > 32 MB), serial number 0x6d826f3d, unlabeled, FAT (16 bit)
```

とりあえず、stringsを書けると、なんか秘密鍵ファイルっぽいのがあります。

```shell
$ strings beelmama | tail -n30 
P?RQcG
{(3z
9X"0
78)fNMD
H&_3
AH6L
d'Uq=
7ikVC
.          
..         
MULLIN~1ENC 
.          
..         
EELZE~1KEY 
9:kz
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDY0YYMzR/sHGdsRjA7vdH+7NT042GUblG282bRZf0Yu+Sss6QU
jVw2laKt7nYz/FGr86K/YGc5Wk2fePujXtl6FnOADsmaAAUODlYyHOfiNjOitY3D
vooHIROiIGiv4lk/3EuJsmNkC7KYFFvEXQc0G4OWMgw9rIdoh7cScgUh9wIDAQAB
AoGBAMuf80IgfyNzBZqFTJU+z3KYH+QhjCondWzZqS1tmEZbaAbd63I11G2bGJ46
/x4RkO5psOYE9szBR3dG2yVyVdD9sAcrNCVxgx1ya7lvHkAI9mKreRmZTsUc3MKl
O3+mkK8CLJuaVDKzz3t0Fv0lbT9szqvq7i6N19vEvc0ilxgZAkEA69qNMn0zktGQ
BmbR61hUaOSQEjZTuMcpG1AqhPymgk2siCZQDrytRoG6TvqYPW9q1Ez4oUYgzOjv
ehaFR+ChQwJBAOtWuZ+lehSjpt5qlTEgFqmXYR/YvLBfp27yw7fLy+AswpQrwZPY
xVYIfKDjaDCrWAVCVVZE2CIDFE8CP9vEpz0CQQCguMpHgbJHdq9i7WZXrlW3NSpI
fuUGohGNH1AaV+FQIoZUMWeU41ZhGb5QW8yq8OYnzlwP6q4ndQTcecRReu3pAkAC
7iGBi13pw9/gBRO2eN/PXMMo0loHGCnNh9hIAZGYSPZjQeg3HwvV9mUW274AXSHL
bvgBCvpl8gPet/hzlA9BAkBmo2ywHcJICVjjK3io78T5QUbIYe2I8YwvAERaALuD
DQzHowZGb0uLoIeuJDqp7gx0NN4ZOp2CHdLLnLqhIIoR
-----END RSA PRIVATE KEY-----
```

で、今度はディスクをマウントします。

```shell
$ sudo mount beelmama /mnt
$ cd /mnt
$ ls -l
total 4.1M
-rwxr-xr-x 1 root root    0 Dec 20  2018 1
-rwxr-xr-x 1 root root    0 Dec 20  2018 10
-rwxr-xr-x 1 root root    0 Dec 20  2018 2
-rwxr-xr-x 1 root root    0 Dec 20  2018 3
-rwxr-xr-x 1 root root    0 Dec 20  2018 4
-rwxr-xr-x 1 root root    0 Dec 20  2018 5
-rwxr-xr-x 1 root root    0 Dec 20  2018 6
-rwxr-xr-x 1 root root    0 Dec 20  2018 7
-rwxr-xr-x 1 root root    0 Dec 20  2018 8
-rwxr-xr-x 1 root root    0 Dec 20  2018 9
drwxr-xr-x 2 root root 2.0K Dec 20  2018 flag/
-rwxr-xr-x 1 root root 1.0M Dec 20  2018 flag3.txt
-rwxr-xr-x 1 root root 1.0M Dec 20  2018 flag_no.txt
-rwxr-xr-x 1 root root 1.0M Dec 20  2018 flag.txt
-rwxr-xr-x 1 root root 1.0M Dec 20  2018 test.txt
```

で。flag/以下にいかにもそれっぽい`mullin.encrypted`っていうファイルがあります。
さっきの秘密鍵で復号化してみる。

```shell
$ openssl rsautl -decrypt -inkey a.key -in mullin.encrypted
CTFKIT{Pandemonium_Mont_Blanc}
```

これでフラグが出てくる。

# 名前を解決したい

いま手元には残っていないが、ドメインが渡されるます。ブラウザで開こうとするとdomain not found.

なので、digコマンドでAレコードをdigするとNXDOMAINが帰ってくる。ちょっと思いついてTXTレコードをdigしてみると、そこにIPアドレスが乗ってるのでビンゴ。
そこへcurlするとフラグが帰ってきます。

# 新人エンジニアの発明

netcatでtcpポートに接続してSQLが実行できる問題。
OSコマンドインジェクションかなーって思ってクォートとか入れてみるとビンゴ。
SQLを入れる欄に以下の通り入れると、lsの結果が出ます。

```
\' ; ls . ;
```

するとflag.txtみたいなのがあるので以下を実行

```
\' ; cat flag.txt ;
```

で、フラグが出てきます。

# 感想

自分は午前中TOEICに行ってて、午後から参加しました。  
既に優秀な後輩と同級生が結構の問題を解いてくれてたので、解けそうなやつに手を付けました。

1問も解けないかなーって思っていたので、4問解けてよかったです（小並感）

結果は10位でした。次回はもうちょい上位行きたいですね。
