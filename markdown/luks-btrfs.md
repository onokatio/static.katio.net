luksを使っているときにgrub-btrfsがうまく動かない
===

grub-mkconfigなどが強制的に終了してしまう。

原因は、grub-probeが暗号化したパーティションからUUIDやファイルシステムのタイプを取得できない点。
なので無理やり固定値に書き換える。

```diff
diff --git a/grub.d/41_snapshots-btrfs b/grub.d/41_snapshots-btrfs
index 4d61b45..8448874 100755
--- a/grub.d/41_snapshots-btrfs
+++ b/grub.d/41_snapshots-btrfs
@@ -102,18 +102,16 @@ export TEXTDOMAINDIR="/usr/share/locale"
 # Boot device
 boot_device=$(${grub_probe} --target=device /boot)
 # hints string
-boot_hs=$(${grub_probe} --device ${boot_device} --target="hints_string" 2>/dev/null)
+boot_hs="--hint='cryptouuid/94654520bbb947b6910ed77e5060ab28'"
 # UUID of the boot partition
-boot_uuid=$(${grub_probe} --device ${boot_device} --target="fs_uuid" 2>/dev/null)
+boot_uuid=7558e027-90c3-46d3-b36f-4d124f772104
 # Type filesystem of boot partition
-boot_fs=$(${grub_probe} --target="fs" /boot 2>/dev/null)
+boot_fs=ext2
 ## Probe info "Root partition"
 # Root device
 root_device=$(${grub_probe} --target=device /)
 # UUID of the root partition
-printf test
-root_uuid=$(${grub_probe} --device ${root_device} --target="fs_uuid" 2>/dev/null)
-printf test
+root_uuid=e8125144-4a36-4f45-bed9-817503407235
 ## Parameters passed to the kernel
 kernel_parameters="$GRUB_CMDLINE_LINUX $GRUB_CMDLINE_LINUX_DEFAULT"
 ## Mount point location
@@ -124,13 +122,7 @@ CLASS="--class snapshots --class gnu-linux --class gnu --class os"
 oldIFS=$IFS
 ## Detect uuid requirement (lvm,btrfs...)
 check_uuid_required() {
-if [ "x${root_uuid}" = "x" ] || [ "x${GRUB_DISABLE_LINUX_UUID}" = "xtrue" ] \
-    || ! test -e "/dev/disk/by-uuid/${root_uuid}" \
-    || ( test -e "${root_device}" && uses_abstraction "${root_device}" lvm ); then
-  LINUX_ROOT_DEVICE=${root_device}
-else
   LINUX_ROOT_DEVICE=UUID=${root_uuid}
-fi
 }

```
