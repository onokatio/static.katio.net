---
title: 人生15回目ぐらいの#ArchlinuxInstallBattle実践
date: 2019-07-10 15:05:17 +0900
---

人生15回目ぐらいの#ArchlinuxInstallBattle実践
===

https://blog.katio.net/page/archlinuxinstall の実践編です。

# ファイルシステムを作る

これに関しては別の記事に記述します。
https://blog.katio.net/page/strong-filesystem

# 最低限でpacstrap

```
# pacstrap /mnt base base-devel btrfs-progs
```

# locale-gen

etckeeperにログが残ってなかったので無理やりdiffとってきました。

```
$ diff <(tar xOf /var/cache/pacman/pkg/glibc-2.29-3-x86_64.pkg.tar.xz etc/locale.gen) /etc/locale.gen -up
--- /proc/self/fd/15    2019-07-11 19:03:07.356811552 +0900
+++ /etc/locale.gen     2019-07-06 23:17:36.535637944 +0900
@@ -173,7 +173,7 @@
 #en_SC.UTF-8 UTF-8  
 #en_SG.UTF-8 UTF-8  
 #en_SG ISO-8859-1  
-#en_US.UTF-8 UTF-8  
+en_US.UTF-8 UTF-8  
 #en_US ISO-8859-1  
 #en_ZA.UTF-8 UTF-8  
 #en_ZA ISO-8859-1  
@@ -298,7 +298,7 @@
 #it_IT@euro ISO-8859-15  
 #iu_CA UTF-8  
 #ja_JP.EUC-JP EUC-JP  
-#ja_JP.UTF-8 UTF-8  
+ja_JP.UTF-8 UTF-8  
 #ka_GE.UTF-8 UTF-8  
 #ka_GE GEORGIAN-PS  
 #kab_DZ UTF-8  

```
# ブートローダー系

grubやintel-ucodeをインストール。ファイルシステムのページに記述。

# ユーザー作成

useraddする。
wheelグループを追加してsudoersにも追加。

# GUI

```
$ sudo pacman -S xorg-server xfce4 xfce4-goodies compton noto-fonts-cjk
```

テーマとアイコン。
```
$ sudo pacman -S materia-gtk-theme papirus-icon-theme
```

# バックアップツールをインストール

```
$ sudo pacman -S snapper snap-pac snap-pac-grub grub-btrfs etckeeper
```

# ネットワークまわり

```
$ sudo pacman -S networkmanager bluez blueman
```

# どっとふぁいる

```
$ git clone https://github.com/onokatio/.conf-to-git
```

# 日本語入力

```
$ sudo pacman -S fcitx-mozc fcitx-gtk3
```

# 音

```
$ sudo pacman -S pulseaudio
```

# その他ツール

```
$ sudo pacman -S neovim zsh albert firefox tlp bind-tools whois openssh guake htop
```

# yayをインストール

```
$ git clone https://aur.archlinux.org/yay.git
$ cd yay
$ makepkg -si
```

# libinput-gestures

```
$ yay -S libinput-gestures
```

# ドライバ

```
$ sudo pacman -S vulkan-intel nvidia
```

```
diff --git a/modprobe.d/nvidia.conf b/modprobe.d/nvidia.conf
index ba0948f..3ae4f6c 100644
--- a/modprobe.d/nvidia.conf
+++ b/modprobe.d/nvidia.conf
@@ -1 +1,5 @@
-#blacklist nvidia
+blacklist nouveau
+blacklist lbm-nouveau
+options nouveau modeset=0
+alias nouveau off
+alias lbm-nouveau off
```

# makepkgの設定

```
$ sudo pacman -S pigz ccache
$ ccache --set-config=max_size=10G
```

以下 /etc/makepkg.confのdiff。

```
diff --git a/makepkg.conf b/makepkg.conf
index 72bddc5..e577366 100644
--- a/makepkg.conf
+++ b/makepkg.conf
@@ -37,11 +37,11 @@ CHOST="x86_64-pc-linux-gnu"
 
 #-- Compiler and Linker Flags
 CPPFLAGS="-D_FORTIFY_SOURCE=2"
-CFLAGS="-march=x86-64 -mtune=generic -O2 -pipe -fno-plt"
-CXXFLAGS="-march=x86-64 -mtune=generic -O2 -pipe -fno-plt"
+CFLAGS="-march=native -O2 -pipe -fno-plt -fstack-protector-strong"
+CXXFLAGS="-march=native -O2 -pipe -fno-plt -fstack-protector-strong"
 LDFLAGS="-Wl,-O1,--sort-common,--as-needed,-z,relro,-z,now"
 #-- Make Flags: change this for DistCC/SMP systems
-#MAKEFLAGS="-j2"
+MAKEFLAGS="-j8"
 #-- Debugging flags
 DEBUG_CFLAGS="-g -fvar-tracking-assignments"
 DEBUG_CXXFLAGS="-g -fvar-tracking-assignments"
@@ -59,14 +59,14 @@ DEBUG_CXXFLAGS="-g -fvar-tracking-assignments"
 #-- check:    Run the check() function if present in the PKGBUILD
 #-- sign:     Generate PGP signature file
 #
-BUILDENV=(!distcc color !ccache check !sign)
+BUILDENV=(!distcc color ccache check !sign)
 #
 #-- If using DistCC, your MAKEFLAGS will also need modification. In addition,
 #-- specify a space-delimited list of hosts running in the DistCC cluster.
 #DISTCC_HOSTS=""
 #
 #-- Specify a directory for package building.
-#BUILDDIR=/tmp/makepkg
+BUILDDIR=/var/tmp/makepkg
 
 #########################################################################
 # GLOBAL PACKAGE OPTIONS
@@ -127,9 +127,9 @@ DBGSRCDIR="/usr/src/debug"
 # COMPRESSION DEFAULTS
 #########################################################################
 #
-COMPRESSGZ=(gzip -c -f -n)
+COMPRESSGZ=(pigz -c -f -n)
 COMPRESSBZ2=(bzip2 -c -f)
-COMPRESSXZ=(xz -c -z -)
+COMPRESSXZ=(xz -c -z - --threads=0)
 COMPRESSLRZ=(lrzip -q)
 COMPRESSLZO=(lzop -q)
 COMPRESSZ=(compress -c -f)
@@ -142,4 +142,4 @@ COMPRESSZ=(compress -c -f)
 #          doing.
 #
 PKGEXT='.pkg.tar.xz'
-SRCEXT='.src.tar.gz'
+SRCEXT='.src.tar.xz'

```
# pacmanのミラー追加

https://wiki.archlinux.jp/index.php/%E3%83%9F%E3%83%A9%E3%83%BC を見ながら/etc/pacman.d/mirrorlistに追加。

```
diff --git a/pacman.d/mirrorlist b/pacman.d/mirrorlist
index e1cf8bb..d100e2d 100644
--- a/pacman.d/mirrorlist
+++ b/pacman.d/mirrorlist
@@ -5,6 +5,9 @@
 ##
 
 Server = http://ftp.jaist.ac.jp/pub/Linux/ArchLinux/$repo/os/$arch
+Server = https://mirrors.cat.net/archlinux/$repo/os/$arch
+Server = http://ftp.tsukuba.wide.ad.jp/Linux/archlinux/$repo/os/$arch
+Server = https://ftp.jaist.ac.jp/pub/Linux/ArchLinux/$repo/os/$arch
 
 ## Romania
 Server = http://archlinux.mirrors.linux.ro/$repo/os/$arch

```

# 非公式ユーザーリポジトリの追加

```
diff --git a/pacman.conf b/pacman.conf
index 8df7b76..6bec01f 100644
--- a/pacman.conf
+++ b/pacman.conf
@@ -98,3 +98,6 @@ Include = /etc/pacman.d/mirrorlist
 #[custom]
 #SigLevel = Optional TrustAll
 #Server = file:///home/custompkgs
+
+[archlinuxcn]
+Server = https://repo.archlinuxcn.org/$arch
```

```
$ sudo pacman -S archlinuxcn-keyring
```

# powerpillの導入

```
yay -S powerpill reflector
```

rsyncは不安定なため今回は使わない。

`/etc/pacman.d/hooks/mirrorupgrade.hook`を以下のように作成。

```
[Trigger]
Operation = Upgrade
Type = Package
Target = pacman-mirrorlist

[Action]
Description = Updating pacman-mirrorlist with reflector and removing pacnew...
When = PostTransaction
Depends = reflector
Exec = /bin/sh -c "reflector --country 'Japan' --sort rate --age 24 --save /etc/pacman.d/mirrorlist;rm -f /etc/pacman.d/mirrorlist.pacnew"
```

これでpacman-mirrorlistが更新されるたびに日本のミラーサーバーが速度順にmirrorlistに上書きされる。

ついでに今実行。
```
$ reflector --country 'Japan' --sort rate --age 24 --save /etc/pacman.d/mirrorlist
```

# preload

```
$ yay -S preload
$ sudo systemctl enable preload.service
```
# watchdog無効化

カーネルパラメーターに`nowatchdog`を追加。

また/etc/modprobe.d/watchnog.confを以下の内容で作成。

```
blacklist iTCO_wdt
```

# sysctl

/etc/sysctl.d/99-sysctl.conf

```
vm.swappiness=0
kernel.sysrq=1

net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1

#### ipv4 networking and equivalent ipv6 parameters ####

## TCP SYN cookie protection (default)
## helps protect against SYN flood attacks
## only kicks in when net.ipv4.tcp_max_syn_backlog is reached
net.ipv4.tcp_syncookies = 1

## protect against tcp time-wait assassination hazards
## drop RST packets for sockets in the time-wait state
## (not widely supported outside of linux, but conforms to RFC)
net.ipv4.tcp_rfc1337 = 1

## sets the kernels reverse path filtering mechanism to value 1 (on)
## will do source validation of the packet's recieved from all the interfaces on the machine
## protects from attackers that are using ip spoofing methods to do harm
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1

## tcp timestamps
## + protect against wrapping sequence numbers (at gigabit speeds)
## + round trip time calculation implemented in TCP
## - causes extra overhead and allows uptime detection by scanners like nmap
## enable @ gigabit speeds
net.ipv4.tcp_timestamps = 0
#net.ipv4.tcp_timestamps = 1

## log martian packets
net.ipv4.conf.default.log_martians = 1
net.ipv4.conf.all.log_martians = 1

## ignore echo broadcast requests to prevent being part of smurf attacks (default)
net.ipv4.icmp_echo_ignore_broadcasts = 1

## ignore bogus icmp errors (default)
net.ipv4.icmp_ignore_bogus_error_responses = 1

## send redirects (not a router, disable it)
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.send_redirects = 0

## ICMP routing redirects (only secure)
#net.ipv4.conf.default.secure_redirects = 1 (default)
#net.ipv4.conf.all.secure_redirects = 1 (default)
net.ipv4.conf.default.accept_redirects=0
net.ipv4.conf.all.accept_redirects=0
net.ipv6.conf.default.accept_redirects=0
net.ipv6.conf.all.accept_redirects=0
```


# mlocate

```
$ sudo powerpill -S mlocate
```

```
diff --git a/updatedb.conf b/updatedb.conf
index 633c174..b258e84 100644
--- a/updatedb.conf
+++ b/updatedb.conf
@@ -1,4 +1,4 @@
 PRUNE_BIND_MOUNTS = "yes"
 PRUNEFS = "9p afs anon_inodefs auto autofs bdev binfmt_misc cgroup cifs coda configfs cpuset cramfs debugfs devpts devtmpfs ecryptfs exofs ftpfs fuse fuse.encfs fuse.sshfs fusectl gfs gfs2 hugetlbfs inotifyfs iso9660 jffs2 lustre mqueue ncpfs nfs nfs4 nfsd pipefs proc ramfs rootfs rpc_pipefs securityfs selinuxfs sfs shfs smbfs sockfs sshfs sysfs tmpfs ubifs udf usbfs vboxsf"
-PRUNENAMES = ".git .hg .svn"
+PRUNENAMES = ".git .hg .svn .snapshots"
 PRUNEPATHS = "/afs /media /mnt /net /sfs /tmp /udev /var/cache /var/lib/pacman/local /var/lock /var/run /var/spool /var/tmp"
```

```
$ sudo updatedb
```

# sysctlやり忘れ

```
diff --git a/sysctl.d/99-sysctl.conf b/sysctl.d/99-sysctl.conf
index c07a283..815641b 100644
--- a/sysctl.d/99-sysctl.conf
+++ b/sysctl.d/99-sysctl.conf
@@ -4,6 +4,11 @@ kernel.sysrq=1
 net.ipv4.tcp_tw_reuse = 1
 net.ipv4.tcp_tw_recycle = 1
 
+kernel.dmesg_restrict = 1
+kernel.kptr_restrict = 1
+net.core.bpf_jit_enable=0
+
+
 #### ipv4 networking and equivalent ipv6 parameters ####
 
 ## TCP SYN cookie protection (default)
```

# 指紋認証

https://wiki.archlinux.jp/index.php/Fprint を参考に。


# proc、tty、sysctl

```
diff --git a/fstab b/fstab
index daf2478..c49697d 100644
--- a/fstab
+++ b/fstab
@@ -23,5 +23,6 @@ UUID=e8125144-4a36-4f45-bed9-817503407235     /home/.snapshots        btrfs           rw,re
 # /dev/mapper/kirino-root
 UUID=e8125144-4a36-4f45-bed9-817503407235      /etc/.git       btrfs           rw,relatime,ssd,space_cache,subvolid=278,subvol=/etc_git,subvol=etc_git,compress=lzo    0 0
 
-
 UUID=435a3634-13f7-496b-9502-57b9e4146344 none swap defaults 0 0
+
+proc   /proc   proc    nosuid,nodev,noexec,hidepid=2,gid=proc  0       0
diff --git a/securetty b/securetty
index 67fb10c..56a1fee 100644
--- a/securetty
+++ b/securetty
@@ -1,12 +1,12 @@
 # File which lists terminals from which root can log in.
 # See securetty(5) for details.
 
-console
-tty1
-tty2
-tty3
-tty4
-tty5
-tty6
-ttyS0
-hvc0
+#console
+#tty1
+#tty2
+#tty3
+#@tty4
+#tty5
+#tty6
+#ttyS0
+#hvc0
diff --git a/sysctl.d/99-sysctl.conf b/sysctl.d/99-sysctl.conf
index 815641b..a36e2ae 100644
--- a/sysctl.d/99-sysctl.conf
+++ b/sysctl.d/99-sysctl.conf
@@ -5,7 +5,7 @@ net.ipv4.tcp_tw_reuse = 1
 net.ipv4.tcp_tw_recycle = 1
 
 kernel.dmesg_restrict = 1
-kernel.kptr_restrict = 1
+kernel.kptr_restrict = 2
 net.core.bpf_jit_enable=0
```


# pacdiffを使うためpacman contribを導入

```
$ sudo powerpill -S pacman-contrib
```

# pacmanのパッケージキャッシュを自動削除

```
diff --git a/grub.d/41_snapshots-btrfs b/grub.d/41_snapshots-btrfs
index 628ae54..597d159 100755
--- a/grub.d/41_snapshots-btrfs
+++ b/grub.d/41_snapshots-btrfs
@@ -424,9 +424,9 @@ boot_bounded()
                detect_microcode
                name_microcode=("${list_ucode[@]##*"/"}")
                # show snapshot found during run "grub-mkconfig"
-               if [[ "${show_snap_found}" = "true" ]]; then
+               #if [[ "${show_snap_found}" = "true" ]]; then
                #printf $"# Found snapshot: %s\n" "$item" >&2 ;
-               fi
+               #fi
                # Show full path snapshot or only name
                path_snapshot
                # Title format in grub-menu
@@ -475,9 +475,9 @@ boot_separate()
                snap_date_time="$(echo "$item" | cut -d' ' -f1-2)"
                snap_date_time="$(trim "$snap_date_time")"
                # show snapshot found during run "grub-mkconfig"
-               if [[ "${show_snap_found}" = "true" ]]; then
+               #if [[ "${show_snap_found}" = "true" ]]; then
                #printf $"# Found snapshot: %s\n" "$item" >&3 ;
-               fi
+               #fi
                # Show full path snapshot or only name
                path_snapshot
                # Title format in grub-menu
```

# systemd resolvedでDNSキャッシュ

```
$ sudo systemctl enable systemd-resolved.service
$ sudo systemctl start systemd-resolved.service
$ sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

こうすることで、/etc/resolved.confがsystemd-resolvedの管理下に置かれ、NetworkManagerは手を出さなくなります。
またstub-resolveを使っているため、nss-witchに対応していないアプリケーションも強制的に127.0.0.1のDNSキャッシュサーバーを利用するようになります。

# grubのメニュー保存

```
diff --git a/default/grub b/default/grub
index 79b1bb8..69fbb86 100644
--- a/default/grub
+++ b/default/grub
@@ -1,6 +1,6 @@
 # GRUB boot loader configuration
 
-GRUB_DEFAULT=0
+GRUB_DEFAULT=saved
 GRUB_TIMEOUT=0
 GRUB_DISTRIBUTOR="Arch"
 GRUB_CMDLINE_LINUX="cryptdevice=PARTUUID=d8f58add-82a9-a34f-8d18-cb3877396a0e:cryptlvm:header"
@@ -51,7 +51,7 @@ GRUB_BACKGROUND="/boot/grub.jpg"
 
 # Uncomment to make GRUB remember the last selection. This requires to
 # set 'GRUB_DEFAULT=saved' above.
-#GRUB_SAVEDEFAULT="true"
+GRUB_SAVEDEFAULT="true"
```

# grub パスフレーズ

```
diff --git a/grub.d/40_custom b/grub.d/40_custom
index 48068de..6f67b91 100755
--- a/grub.d/40_custom
+++ b/grub.d/40_custom
@@ -3,3 +3,20 @@ exec tail -n +3 $0
 # This file provides an easy way to add custom menu entries.  Simply type the
 # menu entries you want to add after this comment.  Be careful not to change
 # the 'exec tail' line above.
+
+set superusers="hoge"
+password_pbkdf2 hoge hogehoge
+
+menuentry "System shutdown" {
+       echo "System shutting down..."
+       halt
+}
+
+menuentry "System restart" {
+       echo "System rebooting..."
+       reboot
+}
+
+menuentry "Firmware setup" {
+       fwsetup
+}
```

# 画面ロック i3lockの導入

```
$ yay -S i3lock-blur
```

i3lockで画像を指定してロックする方法は以下です。

```
$ i3lock -fon
```

これをxfceの画面管理・スリープ管理に登録します。

```
$ xfconf-query -c xfce4-session -p /general/LockCommand -s "i3lock -fon"  --create -t string
```

次に、xfce PowerManagerの設定をします。

## General Buttons

When power button is pressedをHibernateに設定。

これで電源ボタンを押すとハイバーネートに突入します。

## General Lapyop Lid

When laptop lid is closedを、On battery, Plugged in両方共Locl screenに設定。

これで、ノートパソコンの蓋を閉じると画面がロックされ画面オフになります。

## Display power management

トグルスイッチをonにします。
Blank Afterを両方共4 minutesに設定します。
Put to sleep afterを両方共5 minutesに設定します。
Switch off afterを両方共6 minutesに設定します。

## Display Brightness reduction

50%と120 secondsに設定します。

## System power saveing

On batteryとPlugged inを両方共Suspendに設定します。またWhen inactive forを15minutesに設定します。

これで、画面を閉じた状態や開いた状態で15分間放置すると自動でサスペンドします。

## 電源設定まとめ

- 2分以上放置すると、画面の輝度が半分になります
- 4分以上放置すると、画面が黒一色になります
- 5分以上放置すると、画面が低電力状態になります
- 6分以上放置すると、画面の電源が切れます
- 15分放置したらサスペンドに入ります
- 画面を閉じると。画面の電源が切れロックが走ります。この状態で15分立つと、スリープに入ります

以上です。


# bluetoothでLDAC/aptXを有効化

```
$ yay -S  pulseaudio-modules-bt-git bluez-git
```

bluetooth.serviceを編集。
```
$ sudo systemctl edit bluetooth.service
```

エディタが起動するので以下を入力。

```
[Service]
ExecStart=
ExecStart=/usr/lib/bluetooth/bluetoothd -E
```

これで、AAC, APTX, APTX HD, LDACヘッドフォンが使えるようになる。


また音質はデフォルトで自動設定(Adaptive Bit rate)になる。
これは電波状況を見てなるべく途切れずに良い音質を設定するモード。
強制的に最高にするためには`/etc/pulse/default.pa`に以下を追記すればいい。

```
load-module module-bluetooth-discover a2dp_config="ldac_eqmid=hq ldac_fmt=f32"
```


# yubikeyを抜いたら自動ロック

`/etc/udev/rules.d/85-yubikey.rules`を以下の内容で作成します。

```
# Yubikey Udev Rule: running a bash script in case your Yubikey is removed
ACTION=="remove", ENV{ID_BUS}=="usb", ENV{ID_VENDOR_ID}=="1050", ENV{ID_MODEL_ID}=="0407", ENV{ID_SERIAL_SHORT}=="012345678", RUN+="/usr/local/bin/yubikey-lock"
```

このとき、012345678に当てはまる数字はYubikeyの表面に刻印されている数字です。udevadmでも確認できます。

で、 /usr/local/bin/yubikey-lockを作ります。

```
#!/bin/bash

if [ -z "$(lsusb | grep Yubico)" ]; then
        export DISPLAY=:0
        su katio -c "i3lock -fon"
fi
```

あとは再起動するか`sudo udevadm control --reload-rules`を実行すれば有効になります。


# ハードウェアビデオアクセラレーション

https://blog.katio.net/#/page/archlinux-video-acceleration

と。

https://wiki.archlinux.jp/index.php/%E3%83%8F%E3%83%BC%E3%83%89%E3%82%A6%E3%82%A7%E3%82%A2%E3%83%93%E3%83%87%E3%82%AA%E3%82%A2%E3%82%AF%E3%82%BB%E3%83%A9%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

を参考に設定する。

```
$ sudo powerpill -S intel-media-driver nvidia-utils
```

/etc/environmentを編集する。

```
LIBVA_DRIVER_NAME=iHD
VDPAU_DRIVER=nvidia
```

基本的に、VP9やVP8などのサポートをnvidia/vdpauはしていない。
どうせなら外付けGPUの大きなMPEG計算量よりも、VP9のほうが使いたい。
なので、なるべくアプリケーションがVDPAUを呼び出したときもVAAPIを呼び出したときも両方VAAPI/内蔵GPUを使わせたかった。
ただ、VDPAUを呼び出すアプリケーションは、いくらAPIを呼び出してもVP9が使えないのはわかっている（そもそもその時代になかったか、あってもサポートがないのは知っているはず）なので、だったらVDPAUを呼び出したい、つまり高い計算量を必要としているアプリケーションには外付けGPUを使わせてやろうじゃないか、という魂胆。

まあ最近のアプリケーションはそもそもVAAPIとVDPAUの切り替えできるから問題ないよね。それで実質内蔵と外付けの切り替えもできるし。

# ecryptfs

ecryptfsを使ってホームディレクトリを暗号化する。

特に変なことをせずにArchwikiを参照: https://wiki.archlinux.jp/index.php/ECryptfs

# rng-tools

rng-toolsを入れて乱数生成のソースを増やします。
https://wiki.archlinux.jp/index.php/Rng-tools

# GPUのオーバークロックを有効にする

```
$ sudo nvidia-xconfig --cool-bits=28
```

これでcool-bitsを有効にしたnvidiaお手製xorg.confが生成される。ちなみにnvidia-xconfigに頼らず動いてるxorg.confを一応載せておく。

```
Section "ServerLayout"
    Identifier "layout"
    Screen 0 "nvidia"
    Inactive "intel"
EndSection

Section "Device"
    Identifier "nvidia"
    Driver "nvidia"
    BusID "PCI:01:00:0"
EndSection

Section "Screen"
    Identifier "nvidia"
    Device "nvidia"
    Option "AllowEmptyInitialConfiguration"
EndSection

Section "Device"
    Identifier "intel"
    Driver "modesetting"
EndSection

Section "Screen"
    Identifier "intel"
    Device "intel"
EndSectionx
```

で、`nvidia-xsettings`のPowerMizerからクロックとメモリをそれぞれ+60Mhz +1000Mhz。

参考: https://github.com/Cr0wTom/Mi-Notebook-Pro-Mods#overclock-mx150-gpu

# pacmanデータベースの自動バックアップ

```
$ yay -S pakbak-git
$ sudo systemctl enable pakbak.path
$ sudo btrfs subvolume create pakbak
```

# manコマンドの自動化

```
$ yay -S man-pages-ja-git
$ yay -S man-pages-openssh-ja
```

zshrcに以下を追記。

```
alias man='LANG=ja_JP.UTF-8 man'
```

# homectlでユーザー作成

```
homectl create onokatio --shell=/usr/bin/zsh -G tor,lock,vboxusers,wireshark,audit,freenet,zeronet,adbusers,docker,video,uucp,render,lp,input,wheel,onokatio --language=en_US.UTF-8 --memory-high=14G --memory-max=15G --storage=luks --fs-type=btrfs
```
