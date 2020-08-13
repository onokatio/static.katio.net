---
title: "Mi Notebook Pro 2017 (with Archlinux) を低電圧化する"
date: 2019-11-09 18:10:00 +0900
---

Mi Notebook Pro 2017 (with Archlinux) を低電圧化する
===

たまたま、愛用しているMi Notebook向けに低電圧化について説明した英サイトを見つけました。  
そこで解説している方法がWindows向けで落ち込んでいたのですが、その方のGithubを漁ったところLinuxで同じことを可能にする設定ファイルが紹介されていたので使用します。

# intel-undervoltについて

https://github.com/kitsunyan/intel-undervolt



intel-undervoltは、有志の方が開発されているIntel CPUの低電圧化ツールです。
`.conf`拡張子の設定ファイルを読み込ませることで、毎起動時に自動で低電圧化や温度限界、動作モードの設定を適用してくれます。

> 関係ないですが、興味本位でどうやって設定を変えているのかコードを呼んだところ、rootで`/dev/cpu/0/msr`（CPUの設定変更レジスタ）にioctlを発行して、CPUの設定を変えているみたいです。へー。

# 設定ファイル

こちらから頂きました。

https://github.com/Cr0wTom/Mi-Notebook-Pro-Mods/blob/master/Linux%20Scripts/intel-undervolt.conf

# インストール&設定

yayでインストールします。
```shell
$ yay -S intel-undervolt
```

で、とりあえずreadを実行。

```shell
$ sudo intel-undervolt read
modprobe: FATAL: Module msr not found in directory /lib/modules/5.3.7-arch1-2-ARCH
Failed to open MSR device: No such file or directory
Failed to setup the program
```

ありゃ、msrを弄るカーネルモジュールがないって言われてますね。ggるとこんな記事がヒット。  
https://bbs.archlinux.org/viewtopic.php?id=175849

どうやらカーネルのビルドコンフィグに依存しているみたいです。  
確認しましょう。

```shell
$  zcat /proc/config.gz | grep MSR
CONFIG_X86_DEBUGCTLMSR=y
CONFIG_X86_MSR=m
CONFIG_SCSI_ARCMSR=m
```

お、mってことはカーネルじゃなくてやっぱりカーネルモジュールが足りないだけみたいですね。  
~~ただ、`modprobe msr`しても同じく無くて怒られるのでどこからか見つけてきます。~~

カーネルをアップデートしたあと再起動していなかったので、/lib/modulesのパスが見に行けなかっただけでした…。ということでパソコンを再起動してmodprobeします。

```shell
$ sudo modprobe msr
$ sudo intel-undervolt read
CPU (0): -0.00 mV
GPU (1): -0.00 mV
CPU Cache (2): -0.00 mV
System Agent (3): -0.00 mV
Analog I/O (4): -0.00 mV
```

はい。今の所何も変更されていないようです。

設定ファイルを流し込みます。

```shell
$ wget https://github.com/Cr0wTom/Mi-Notebook-Pro-Mods/raw/master/Linux%20Scripts/intel-undervolt.conf
$ sudo mv intel-undervolt.conf /etc/
$ intel-undervolt apply

Warning: 'apply' option is deprecated, use 'undervolt' instead
Warning: 'tdp' option is deprecated, use 'power package' instead

CPU (0): Values do not equal
CPU Cache (2): Values do not equal

Short term package power: 50 W, 0.002 s, enabled
Long term package power: 50 W, 28.000 s, enabled
```

一部有効になっているみたいですが、エラーが出ているみたいなので手直しします。

ひとまず、項目がdeprecatedと表記されているので、githubのドキュメントを読みつつ最新の設定項目名に変更しました。

```diff
$ diff <(curl -SsL https://github.com/Cr0wTom/Mi-Notebook-Pro-Mods/raw/master/Linux%20Scripts/intel-undervolt.conf) /etc/intel-undervolt.conf
5c5
< apply 0 'CPU' -105
---
> undervolt 0 'CPU' -105
7c7
< apply 2 'CPU Cache' -105
---
> undervolt 2 'CPU Cache' -105
15c15
< tdp 50 50
---
> power package 50 50

```

まあ見てわかるとおりapplyとtdpをundervoltとpower packageに置き換えただけです。エラーメッセージのとおりですね。
次は`CPU (0): Values do not equal`と`CPU Cache (2): Values do not equal`を解決します。このエラーメッセージの意味がよくわからないので当該コードを見てみましょう。

https://github.com/kitsunyan/intel-undervolt/blob/ea0e74c583fb0ba4bccd896d3e9c7eb83507b749/undervolt.c#L68

```c=65
		const char * errstr = NULL;
		if (!write_success || !read_success) {
			errstr = strerror(errno);
		} else if (write && (rdval & 0xffffffff) != (wrval & 0xffffffff)) {
			errstr = "Values do not equal";
		}
```

どうやら、書き込んだ値とその後確認のため読み出した値が一致しないようです。  
`intel undervolt Values do not equal`とかでググると一件Issueがヒットしました。

https://github.com/kitsunyan/intel-undervolt/issues/25

どうやら「そもそも設定ができないCPU/BIOSである」か「設定は完了したがそもそもCPUの電圧のReadが許可されてないCPU/BIOSである」みたいです。  
うーん、と悩んだところでintel-undervoltの設定ファイルがおいてあったgithubリポジトリに興味深い項目が見つかりました。

https://github.com/Cr0wTom/Mi-Notebook-Pro-Mods#enable-cpu-undervolting-feature

そもそもBIOSの設定を変更しないとCPUの低電圧化はできないようです。

# と、いうことでBIOSの設定を改変します

自分のBIOSバージョンを確認したところ、`XMAKB5R0P0603`のようです。  
ちょうどこのリポジトリにあるサポートバージョンでした。

説明を読むと、`/Patchs/voltage_unlock.cmd`を実行するとCPUの低電圧化が有効になるらしいです。コマンドプロンプトのバッチファイルはどのみちLinuxでは動きません。とりあえず中を見てみましょう。

```cmd=
@echo off
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
echo Requesting administrative privileges...
goto request
) else (goto start)

:request
echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
set params = %*:"=""
echo UAC.ShellExecute "cmd.exe", "/c %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
"%temp%\getadmin.vbs"
del "%temp%\getadmin.vbs"
exit /b

:start
pushd %~dp0bin
echo Xiaomi Mi Notebook Pro iXTU voltage unlock patch by _Cyb_
echo Tested on 0502 and 0603 BIOS
h2ouve -gv cpusetup_my.txt -n CpuSetup
if exist "cpusetup_my.txt" (
    echo Successfully read variables
) else (
    echo Failed to read variables!
    pause
    exit /b
)
powershell set-executionpolicy remotesigned
powershell ./patchscript_vue
if exist "cpusetup_patched.txt" (
    echo Writing patched variables
    h2ouve -sv cpusetup_patched.txt -n CpuSetup
    echo Done! Do not forget to reboot!
) else (
    echo FAILED!
)
echo.
pause
```

おそらく20行目でh2ouveというツールを使い何らかのファイルを取得、29行目で書き換え、32行目で書き換えしているようです。  
ということで重要なのは29行目の`patchscript_vue`でしょう。中を見てみます。パスは`/Patches/bin/patchscript_vue.ps1`のようです。

```ps=
$location = Get-Location
$bytes = [System.IO.File]::ReadAllBytes("$location\cpusetup_my.txt")
$text = [System.Text.Encoding]::Default.GetString($bytes)
$GUID_text = "B08F97FF-E6E8-4193-A997-5E9E9B0ADB32"
If($text.IndexOf($GUID_text) -eq -1){
Write-Warning "GUID of your BIOS not found! Now exit"
exit
}
$offset_bytes = 0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x30,0x30,0x30,0x30,0x30,0x30,0x45,0x30,0x3A
$offset_text = [System.Text.Encoding]::Default.GetString($offset_bytes)
If($text.IndexOf($offset_text) -eq -1){
Write-Warning "Your BIOS is not supported!!! Now exit"
exit
}
$offset = $text.IndexOf($offset_text) + 0x37
$bytes[$offset] = 0x30
[System.IO.File]::WriteAllBytes("$location\cpusetup_patched.txt", $bytes)%
```

どうやら、h2ouveで取得してきた`cpusetup_my.txt`というファイルを編集しているみたいです。  
ここでh2ouveについて調べてみます。

https://www.insyde.com/press_news/press-releases/insyde%C2%AE-software-revamps-uefi-bios-tools-introduces-new-licensing-options-

このサイトによると、`UEFI Variable Editor`とのことです。UEFI変数を書き換えているだけならLinuxの`efivar`コマンドでも同じことができそうなので、やってみましょう。

`voltage_unlock.cmd`ではh2ouveに`-n CpuSetup`という引数を与えています。そして`patchscript_vue.ps1`では`B08F97FF-E6E8-4193-A997-5E9E9B0ADB32`という引数を与えています。

ここで、`efivar -l`コマンドを実行します。いっぱい出てきたので`B08F97FF-E6E8-4193-A997-5E9E9B0ADB32`でgrepをかけます。

…？何も出てきません。よく見るとefivarは小文字で16進数を表記するみたいです。大文字を小文字に変換しつつgrepしましょう。

```shell
$ efivar -l | grep $(echo B08F97FF-E6E8-4193-A997-5E9E9B0ADB32 | tr [A-Z] [a-z])
b08f97ff-e6e8-4193-a997-5e9e9b0adb32-CpuSetupVolatileData
b08f97ff-e6e8-4193-a997-5e9e9b0adb32-CpuSetup
b08f97ff-e6e8-4193-a997-5e9e9b0adb32-Custom
```

ビンゴです。おそらく`b08f97ff-e6e8-4193-a997-5e9e9b0adb32-CpuSetup`というのが該当変数でしょう。

ここで`patchscript_vue.ps1`の中身をちゃんと見ています。powershellを見るのは初めてですが、雰囲気で読んでいきましょう。

`0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x30,0x30,0x30,0x30,0x30,0x30,0x45,0x30,0x3A`という部分が目に付きます。これを`GetString`しているところから、おそらくこれはasciiコードでしょう。これを文字にしてみます。

```
$ echo 0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x30,0x30,0x30,0x30,0x30,0x30,0x45,0x30,0x3A | tr ',' '\n' | sed -e 's/0x//' | while read line;do printf "\x$line";done
           000000E0:
```

> ※この記事を書いているときは格好つけてシェルで変換してますが、実際作業しているときは16進数変換サイトに打ち込んでたりします
> 
000000E0という文字が出てきました、これはおそらく変数の番地ですね。ということでefivarsで変数の中身を見てみます。

```shell=
$ efivar --print --name b08f97ff-e6e8-4193-a997-5e9e9b0adb32-CpuSetup
GUID: b08f97ff-e6e8-4193-a997-5e9e9b0adb32
Name: "CpuSetup"
Attributes:
        Non-Volatile
        Boot Service Access
        Runtime Service Access
Value:
00000000  08 14 14 00 01 01 00 00  00 01 01 00 01 01 01 01  |................|
00000010  00 00 00 00 00 00 01 00  00 00 00 00 00 00 00 00  |................|
00000020  00 00 01 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000030  00 00 00 00 00 01 01 03  03 02 02 01 01 00 00 00  |................|
00000040  00 00 04 01 07 02 02 02  02 02 02 4e 00 76 00 94  |...........N.v..|
00000050  00 fa 00 4c 01 f2 03 00  00 00 00 00 00 00 00 00  |...L............|
00000060  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000070  00 00 00 00 00 00 01 01  00 00 00 02 00 00 00 00  |................|
00000080  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000090  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
000000a0  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
000000b0  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
000000c0  00 00 00 00 00 00 00 00  00 00 00 00 00 01 01 01  |................|
000000d0  01 00 00 01 01 00 00 00  00 00 00 00 01 01 00 01  |................|
000000e0  01 14 28 28 25 25 28 28  25 25 00 01 00 00 01 00  |..((%%((%%......|
000000f0  00 00 02 00 00 00 00 00  00 27 8f a4 5f 8d fd 3d  |.........'.._..=|
00000100  55 c1 fd 4b be b9 67 67  d7 02 02 00 ff 00 00 00  |U..K..gg........|
00000110  00 00 00 00 01 01 01 01  00 00 00 00 00 00 00 00  |................|
00000120  00 00 00 00 00 00 00 00  50 00 00 00 00 00 00 00  |........P.......|
00000130  14 00 00 00 00 00 00 00  04 00 00 00 00 00 00 00  |................|
00000140  01 01 01 01 01 01 01 01  00 00 00 00 00 00 00 00  |................|
00000150  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000160  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000170  00 00 00 00 01 01 01 01  00 00 00 00 00 00 00 00  |................|
00000180  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000190  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
000001a0  00 00 00 00 01 00 00 00  00 00 00 00 00 00 00 00  |................|
000001b0  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
000001c0  00 00 00 00 00 00 02 00  00 00 00 00 01 00 00 00  |................|
000001d0  03 01 00 01 00 00 00 00  00 00 00 00 00 00 00 00  |................|
000001e0  01 00 00 00 00 00 00 00  00 00 00 00 00 00 00     |............... |

```

23行目の000000e0がおそらくビンゴです。次の`$offset = $text.IndexOf($offset_text) + 0x37`が~~よくわかりません~~、が、ここで`Patches/Voltage Patch/bin`以下にcpusetup_my.txtとcpusetup_patched.txtを見つけました。おそらく製作者の方のものでしょう。diffを取ります。

> 追記: 0x37わかりました。10進数で55ですが、これはcpusetup_my.txtファイル内での当該ビットですね、おそらく。
>cutコマンドが1 originなこと、IndexOfが0 originなことを考えるとなんか1足りませんが、まあ良しとします
>```
>$ cat cpusetup_my.txt | grep 00E0 | cut -c-57
>            000000E0: 01 14 28 28 25 25 28 28 25 25 00 01
>$ cat cpusetup_my.txt | grep 00E0 | cut -c57-57
>1
>```

```
diff cpusetup_my.txt cpusetup_patched.txt         47c47
<             000000E0: 01 14 28 28 25 25 28 28 25 25 00 01 00 00 01 00
---
>             000000E0: 01 14 28 28 25 25 28 28 25 25 00 00 00 00 01 00
```

ビンゴですね。`01`が`00`になっています。  
`$bytes[$offset] = 0x30`の0x30はasciiコードで`0`なので、たぶんあってますね。

ということで、1を0に変更します。

```shell
$ cp /sys/firmware/efi/efivars/CpuSetup-b08f97ff-e6e8-4193-a997-5e9e9b0adb32 .
$ vi CpuSetup-b08f97ff-e6e8-4193-a997-5e9e9b0adb32 #ここで書き換える
$ cat CpuSetup-b08f97ff-e6e8-4193-a997-5e9e9b0adb32 | sed -e 's/  |.*//' > hex # 文字のプレビューを消す
$ cat hex | sed -e 's/^[0-9a-z]*  //' > hex2 # 行番号を消す
$ xxd -r -p hex2 > hex3 # 16進数からバイナリへ
$ sudo efivar --write --name b08f97ff-e6e8-4193-a997-5e9e9b0adb32-CpuSetup --fromfile=hex3 # 書き込み
```

以上で変更完了です。試しに確認してみましょう。

```shell
$ cat /sys/firmware/efi/efivars/CpuSetup-b08f97ff-e6e8-4193-a997-5e9e9b0adb32 | xxd
00000000: 0700 0000 0814 1400 0101 0000 0001 0100  ................
00000010: 0101 0101 0000 0000 0000 0100 0000 0000  ................
00000020: 0000 0000 0000 0100 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0001 0103 0302 0201  ................
00000040: 0100 0000 0000 0401 0702 0202 0202 024e  ...............N
00000050: 0076 0094 00fa 004c 01f2 0300 0000 0000  .v.....L........
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0101 0000 0002  ................
00000080: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000090: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000a0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000b0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000c0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000d0: 0001 0101 0100 0001 0100 0000 0000 0000  ................
000000e0: 0101 0001 0114 2828 2525 2828 2525 0000  ......((%%((%%..
000000f0: 0000 0100 0000 0200 0000 0000 0027 8fa4  .............'..
00000100: 5f8d fd3d 55c1 fd4b beb9 6767 d702 0200  _..=U..K..gg....
00000110: ff00 0000 0000 0000 0101 0101 0000 0000  ................
00000120: 0000 0000 0000 0000 0000 0000 5000 0000  ............P...
00000130: 0000 0000 1400 0000 0000 0000 0400 0000  ................
00000140: 0000 0000 0101 0101 0101 0101 0000 0000  ................
00000150: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000160: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000170: 0000 0000 0000 0000 0101 0101 0000 0000  ................
00000180: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000190: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000001a0: 0000 0000 0000 0000 0100 0000 0000 0000  ................
000001b0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000001c0: 0000 0000 0000 0000 0000 0200 0000 0000  ................
000001d0: 0100 0000 0301 0001 0000 0000 0000 0000  ................
000001e0: 0000 0000 0100 0000 0000 0000 0000 0000  ................
000001f0: 0000 0000                                ....
```

なんか4バイト増えてますが多分問題ないので無視しましょう。で、再起動します。


# 改めて電圧を変更する

再起動が完了したら、改めてapplyしましょ。
```shell
$ sudo intel-undervolt apply
CPU (0): -105.47 mV
CPU Cache (2): -105.47 mV

Short term package power: 50 W, 0.002 s, enabled
Long term package power: 50 W, 28.000 s, enabled

$ sudo intel-undervolt read
CPU (0): -105.47 mV
CPU Cache (2): -105.47 mV

Short term package power: 50 W, 0.002 s, enabled
Long term package power: 50 W, 28.000 s, enabled
```

無事、低電圧化の設定に完了しました。これで少しでもバッテリーが長持ちすれば嬉しいですね。

# 自動起動

```
$ sudo systemctl enable intel-undervolt
```

以上、休日の作業履歴でしたー。

参考: https://wiki.archlinux.jp/index.php/CPU_%E3%81%AE%E4%BD%8E%E9%9B%BB%E5%9C%A7%E5%8C%96#intel-undervolt
