Archlinuxをインストールしたので手順の備忘録。
===

# ファイルシステムを作る

これに関しては別途記述する。

# 最低限でpacstrap

```
# pacstrap /mnt base base-devel btrfs-progs
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

