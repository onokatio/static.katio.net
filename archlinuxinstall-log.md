人生15回目ぐらいの#ArchlinuxInstallBattle実践
===

https://blog.katio.net/#/page/archlinuxinstall の実践編です。

# ファイルシステムを作る

これに関しては別の記事に記述します。
https://blog.katio.net/#/page/strong-filesystem

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

テーマとアイコン
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

以下 /etc/makepkg.confのdiff

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

https://wiki.archlinux.jp/index.php/%E3%83%9F%E3%83%A9%E3%83%BC を見ながら/etc/pacman.d/mirrorlistに追加

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

`/etc/pacman.d/hooks/mirrorupgrade.hook`を以下のように作成

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

ついでに今実行
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

また/etc/modprobe.d/watchnog.confを以下の内容で作成

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

https://wiki.archlinux.jp/index.php/Fprint を参考に
