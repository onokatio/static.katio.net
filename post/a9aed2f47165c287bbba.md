---
title: ArchlinuxのVirtualboxで「Failed to insert 'vboxdrv': Exec format error」となるとき
tags: Linux archLinux VirtualBox
author: onokatio
slide: false
---
ある日、Linuxの起動メッセージを見たら赤い謎の部分がある。
怖いのでsystemctlで見てみたら、なんと`systemd-modules-load.service`が起動時にエラーを起こしているみたいで、確認してみたらこんな表示が。

```
12月 25 22:38:00 archlinux systemd-modules-load[3217]: Failed to find module 'acpi_call'
12月 25 22:38:00 archlinux systemd-modules-load[3217]: Failed to find module 'vboxdrv'
12月 25 22:38:00 archlinux systemd-modules-load[3217]: Failed to find module 'vboxpci'
12月 25 22:38:00 archlinux systemd-modules-load[3217]: Failed to find module 'vboxnetadp'
12月 25 22:38:00 archlinux systemd-modules-load[3217]: Failed to find module 'vboxnetflt'
12月 25 22:38:00 archlinux systemd[1]: systemd-modules-load.service: Main process exited, code=exited, status=1/F
12月 25 22:38:00 archlinux systemd[1]: systemd-modules-load.service: Failed with result 'exit-code'.
12月 25 22:38:00 archlinux systemd[1]: Failed to start Load Kernel Modules.
```

そして、案の定VirtualBoxで仮想マシンが起動しない。

# 解決方法

原因は、Linuxのカーネルをデフォルトから変更していたことでした。
自分は`Linux-pf`を導入していたのでそれが問題です。
pacmanでインストールできるvirtualvoxは、デフォルトで`virtualbox-host-modules-arch`というパッケージを依存とします。これはvirtualboxが起動に必要なカーネルのモジュールなのですが、デフォルトのlinuxカーネルにしかインストールされません。
なので、かわりに`virtualbox-host-dkms`をインストールする必要があります。

```
$ sudo pacman -S virtualbox-host-dkms
```

インストールするときに、「これはvirtualbox-host-modules-archと衝突するからvirtualbox-host-modules-arch消しとく？」みたいな表示があるので問答無用で消します。

これで無事エラーは出ず、仮想マシンも起動できるようになりました。
やったね！！





**っていうか[archlinux wiki](https://wiki.archlinux.jp/index.php/VirtualBox)に書いてあるじゃん！！！！**

