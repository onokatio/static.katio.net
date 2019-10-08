Linuxで高音質Bluetoothを使う（AAC,aptX,LDAC）
===

Linuxマシンをメイン機にされている方は、Bluetoothヘッドホンやイヤホンを接続する機会があると思います。
通常、Linuxでpulseaudio+bluez構成では、どんなに高機能なイヤホンを接続したどころでSBCと呼ばれる一番音質の低いモードでしか接続されません。

そのため今回は、スマートフォン等と接続するときに使用される、AACやaptX、aptX HD、LDACと呼ばれるコーデックをLinuxで使えるようにします。

# インストール

既にbluez、pulseaudio、pulseaudio-bluetooth等のパッケージをインストールしていると思います。pulseaudio-bluetoothのみアンインストールしてください。

その後、以下のリポジトリからpulseaudio-module-btをインストールしてください。

https://github.com/EHfive/pulseaudio-modules-bt

Ubuntuの場合はppaが、Archlinuxの場合はAURが存在します。

```
$ yay -S bluetooth-module-bt
```

他のディストリビューションの方はおとなしくソースからビルドしましょう。

また、コーデックのライブラリをインストールするため、ffmpegと[libldac](https://github.com/EHfive/ldacBT)をインストールしてください。
後者はArchlinuxにAURが存在します。

インストールが完了したら再起動してください。
（めんどくさい人はpulseaudio -kしたあとsudo systemctl restart bluetoothでも良いです。）

# 使い方

いつもどおりヘッドホン/イヤホンをbluetoothで接続します。その後、pavucontrolを起動しましょう。

![](https://i.imgur.com/t58XpPF.png)

Configurationのタブに、プロファイルを選択する欄が出てきます。
ここで、HSP/HFP（マイクを使用するコーデック）やSBC、AAC、LDACなどが選択できるようになります。

プロファイルが複数使える場合、自動的に一番高音質なプロファイルで接続するらしです。
( LDAC > APTX HD > APTX > AAC > SBC)
# おまけ、LDACのアダプティブビットレートモードについて

どうやらpulseaudio-module-btは、LDACで接続するときに、LDACのアダプティブビットレートにデフォルトで対応しているようです。電波が良い状況ではなるべく高ビットレートで接続し、悪くなると多少音質を下げ接続を続行します。

![](https://i.imgur.com/oPodrob.png)

もし強制的に高ビットレートや低ビットレートで接続したい場合、default.paを弄れば可能とのことです。興味のある方はgithubのwikiを参照してください。
