---
title: GPD PocketのLinuxでwifiが使えなくなった
tags: Linux GPDPocket
author: onokatio
slide: false
---
dmesgにこんな出力が出る。

```
direct firmware load for brcm/brcmfmac4356-pcie.clm_blob
```

https://bugs.launchpad.net/ubuntu/+source/linux-firmware/+bug/1772624

ここを見ると、どうやらlinux-firmwareの最新のバージョンにBCM4356のバグがあるらしい。
ということで最新のバージョン（linux-firmware-20180606）から前のバージョン（linux-firmware-20180518）にダウングレードして解決。

