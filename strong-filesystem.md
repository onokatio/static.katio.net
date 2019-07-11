ルート以下を吹き飛ばした男が作った、泣かない最強のファイルシステム構成
===

先日、`cd /`した状態で`sudo rm -rf *`を実行してしばらく放心状態になっていました。
と、いうことで、OSを再インストールしつつ最強のファイルシステム構成を作っていきます。

# 実現したいこと

- バックアップが取りやすい
- 復元しやすい
- ディスクをすべて暗号化したい
- あとから構成を変更しやすい

# 使用するディスク

NVMe SSDを使用します。

# ルートで使うファイルシステム

メインとして、btrfs on LVM構成を採用します。
btrfsはサブボリューム（特定ディレクトリ）のスナップショット（バックアップ）を取るのが比較的簡単で、自動化が可能です。
またLVMに乗せることで、あとからパーティションを増やしたり、また後術する暗号化の楽になります。


今回、btrfsの一番上のディレクトリにサブボリューム（ディレクトリ）を作り、それをマウントしています。
これが後術するスナップショットの利便性のためです。

# スワップパーティション

ハイバーネートを使いたいため、LVMの上にスワップパーティションも載せます。

# 暗号化

LVMを暗号化パーティション、LUKSの上に載せます。
このため、暗号化パーティションを復号/暗号化するだけで、LVMの上に作ったパーティションが全部復号化/暗号化されます。

# ブートパーティション

grubのモジュールや設定ファイル、vmlinuzやinitramfsを置くパーティションです。
ブートパーティションは、先述したLVMやLUKSにはおかず、単体でext4パーティションを作成します。
またこのパーティションもLUKSで暗号化します。

また、ルートで使うLUKSはリモートLUKSにし、LUKSヘッダをここにおいておきます。
このおかげで、ルートパーティションにブルートフォースアタックなどが行われた場合や、パーティション情報の取得を行った場合、非常に高い耐性が付きます。

# EFIパーティション

grubを入れるパーティションです。ここだけは暗号化しません。
暗号化しないかわりに、セキュアブートを使用します。 
https://blog.katio.net/#/page/secureboot

# スナップショット

snapperを使用します。自動でサブボリュームのバックアップを撮ってくれます。


# 全体図

### lsblk

```
NAME              MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINT
nvme0n1           259:0    0 465.8G  0 disk  
├─nvme0n1p1       259:1    0     1G  0 part  /boot/efi
├─nvme0n1p2       259:2    0     1G  0 part  
│ └─cryptboot     254:3    0  1022M  0 crypt /boot
└─nvme0n1p3       259:3    0 463.8G  0 part  
  └─cryptlvm      254:0    0 463.8G  0 crypt 
    ├─kirino-swap 254:1    0    16G  0 lvm   [SWAP]
    └─kirino-root 254:2    0 447.8G  0 lvm   /

```

### fstab

```
# Static information about the filesystems.
# See fstab(5) for details.

# <file system> <dir> <type> <options> <dump> <pass>
# /dev/mapper/kirino-root
UUID=e8125144-4a36-4f45-bed9-817503407235       /               btrfs           rw,relatime,ssd,space_cache,subvolid=258,subvol=/root,subvol=root,compress=lzo  0 0

# /dev/mapper/kirino-root
UUID=e8125144-4a36-4f45-bed9-817503407235       /home           btrfs           rw,relatime,ssd,space_cache,subvolid=257,subvol=/home,subvol=home,compress=lzo  0 0

# /dev/mapper/cryptboot
UUID=7558e027-90c3-46d3-b36f-4d124f772104       /boot           ext4            rw,relatime,data=ordered        0 2

# /dev/nvme1n1p1
UUID=A67B-1827          /boot/efi       vfat            rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=iso8859-1,shortname=mixed,errors=remount-ro    0 2

# /dev/mapper/kirino-root
UUID=e8125144-4a36-4f45-bed9-817503407235       /.snapshots             btrfs           rw,relatime,ssd,space_cache,subvolid=260,subvol=/snapshot_root,subvol=snapshot_root,compress=lzo        0 0

# /dev/mapper/kirino-root
UUID=e8125144-4a36-4f45-bed9-817503407235       /home/.snapshots        btrfs           rw,relatime,ssd,space_cache,subvolid=259,subvol=/snapshot_home,subvol=snapshot_home,compress=lzo        0 0

# /dev/mapper/kirino-root
UUID=e8125144-4a36-4f45-bed9-817503407235       /etc/.git       btrfs           rw,relatime,ssd,space_cache,subvolid=278,subvol=/etc_git,subvol=etc_git,compress=lzo    0 0
```

# 作業

## パーティション切り

fdiskで、nvme ssdに３つのパーティションを作成します。
一つがEFI、もう一つがext4、最後がLVMです。

```
Device           Start       End   Sectors   Size Type
/dev/nvme0n1p1    2048   2099199   2097152     1G EFI System
/dev/nvme0n1p2 2099200   4196351   2097152     1G Linux filesystem
/dev/nvme0n1p3 4196352 976773134 972576783 463.8G Linux LVM
```

## EFIをフォーマット

```
$ sudo mkfs.fat -F32 /dev/nvme0n1p1
```

## /bootを作る

```
$ sudo cryptsetup luksFormat /dev/nvme0n1p2
$ sudo cryptsetup luksOpen /dev/nvme0n1p2 cryptboot
$ sudo mkfs.ext4 /dev/mapper/cryptboot
```

これで`/dev/mapper/cryptboot`ができます。

## lvmを作る

```
$ sudo cryptsetup luksFormat /dev/nvme0n1p3 --header header.img
$ sudo cryptsetup luksOpen --header header.img /dev/nvme0n1p3 cryptbootcryptlvm
```

これで`/dev/mapper/cryptlvm`ができます。

次はlvmの設定します。

参考: https://qiita.com/onokatio/items/6af256524397ae8ddc79

```
$ sudo pvcreate /dev/mapper/cryptlvm
$ sudo vgcreate kirino /dev/mapper/cryptlvm
$ sudo lvcreate -L 16G kirino -n swap
$ sudo lvcreate -l 100%FREE kirino -n root
```

こんな感じになる。

```
  --- Logical volume ---
  LV Path                /dev/kirino/swap
  LV Name                swap
  VG Name                kirino
  LV UUID                VRojSs-EtaE-AMdR-eGVb-OOB9-NB1T-0WPiCq
  LV Write Access        read/write
  LV Creation host, time archiso, 2019-07-06 15:03:06 +0900
  LV Status              available
  # open                 2
  LV Size                16.00 GiB
  Current LE             4096
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           254:1
   
  --- Logical volume ---
  LV Path                /dev/kirino/root
  LV Name                root
  VG Name                kirino
  LV UUID                VZi8T1-L2lM-a7DM-rkgA-1iQE-0Z0N-Q664e2
  LV Write Access        read/write
  LV Creation host, time archiso, 2019-07-06 15:03:35 +0900
  LV Status              available
  # open                 1
  LV Size                <447.76 GiB
  Current LE             114626
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           254:2
   

```

## ルートファイルシステムを作る
```
$ sudo mount /dev/mapper/lvolroot /mnt
$ sudo btrfs subvolume create root
$ sudo btrfs subvolume create home
$ sudo btrfs subvolume create root_snapshot
$ sudo btrfs subvolume create home_snapshot
$ sudo btrfs subvolume create etc_git
$ sudo umount /mnt

$ sudo mount -o subvol=/root /dev/mapper/kirino-root /mnt
$ sudo mkdir /mnt/home
$ sudo mount -o subvol=/home /dev/mapper/kirino-root /mnt/home
$ sudo mkdir /mnt/boot
$ sudo mkdir /mnt/boot/efi
$ sudo mount /dev/mapper/cryptboot /mnt/boot
$ sudo mount /dev/nvme0n1p1 /mnt/boot/efi
```

ここで/mntにpacstrapします。

で、genfstab。上で載せた感じのfstabになればok。
grubもインストール。あとheader.imgを/boot以下に移しておく。

# ブートローダー/initcpio

https://wiki.archlinux.jp/index.php/Dm-crypt/%E7%89%B9%E8%A8%98%E4%BA%8B%E9%A0%85#.E3.83.AA.E3.83.A2.E3.83.BC.E3.83.88_LUKS_.E3.83.98.E3.83.83.E3.83.80.E3.83.BC.E3.82.92.E4.BD.BF.E3.81.A3.E3.81.A6.E3.82.B7.E3.82.B9.E3.83.86.E3.83.A0.E3.82.92.E6.9A.97.E5.8F.B7.E5.8C.96 に従ってencryptフックを修正、リモートヘッダーで起動できるようにする。

また、カーネルコマンドラインにcryptdeviecを追加

```
GRUB_CMDLINE_LINUX_DEFAULT="cryptdevice=PARTUUID=d8f58add-82a9-a34f-8d18-cb3877396a0e:cryptlvm:header resume=/dev/mapper/kirino-swap nowatchdog"
```

あと起動後に/bootをマウントできるようにキーファイルをluksに追加して/etc/crypttabに追加

```
cryptboot UUID=94654520-bbb9-47b6-910e-d77e5060ab28 /cryptboot_keyfile luks
```

/etc/mkinitcpio.confのhookはこんな感じ

```
HOOKS=(base udev autodetect modconf keyboard keymap block encrypt2 lvm2 resume filesystems keyboard fsck)
```


これでarch live usbを抜いて他の設定をしてOSを起動します。

# snapper

```
$ snapper -c root create-config /
$ snapper -c home create-config /home
```

```
$ sudo rm -rf /.snapshots
$ sudo mount -o subvol=/root_snapshot /dev/mapper/kirino-root /.snapshots
```

```
$ sudo rm -rf /home/.snapshots
$ sudo mount -o subvol=/home_snapshot /dev/mapper/kirino-root /home/.snapshots
```

```
$ sudo mv /etc/.git /etc/.git_old
$ sudo mkdir /etc/.git
$ sudo mount -o subvol=/etc_git /dev/mapper/kirino-root /etc/.git
$ sudo mv /etc/.git_old/* /etc/.git/
```

以上、fstabにも追加して終了。

# 追記: バックアップ

snapperはほ消しちゃったファイルの復元なんかにつかいます。
そもそもファイルシステム全体をバックアップするためには別にディスクをつないでそこへコピーしてあげる必要があります。
なので、今回は一番最新のスナップショットを外付けSSDへ保管するようにします。

```
$ sudo powerpill -S snap-sync
$ sudo cryptsetup luksFormat /dev/sda1
$ sudo cryptsetup luksOpen /dev/sda1 externalssd
$ sudo mkfs.btrfs /dev/mapper/externalssd
$ sudo snap-sync -c root -u cbb989c9-f01b-4f12-bfbf-fab53bf20546
# このUUIDは/dev/mapper/externalssdのもの。
# -cのあとはsnapperの設定ファイル名
# 基本的にはエンター連打でOKです。勝手にバックアップ先のディレクトリを作ってくれます。
```

以上で、最新のスナップショットが取得され、あとは勝手に`/mnt/root/<数字>`というディレクトリが作成されます。
ホストの/.snapshotsの中の数字と同じスナップショットが保管されます。

以降は、以下のコマンドで自動でバックアップが行なえます。

```
$ sudo snap-sync -c root -u cbb989c9-f01b-4f12-bfbf-fab53bf20546
```

# 追記: 圧縮

btrfsは透過圧縮をサポートしています。lzoを使うとCPUをあまり使わずにそこそこディスク読み書きが高速化するらしいです。
※特段実験はしていない。

```
$ sudo btrfs filesystem defragment -r -v -clzo /
$ sudo btrfs filesystem defragment -r -v -clzo /home
```

また、fstabにもcompress=lzoオプションを追記します。

# おわり

人によってはここからtrim/discardの設定が入るかも。
