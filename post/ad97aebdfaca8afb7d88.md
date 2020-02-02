---
title: ラズパイにSoftether VPNサーバーを構築してみた
tags: Linux SoftEther
author: onokatio
slide: false
---
こんにちは！

タイトル通り、raspberrypi 2 Bにssl vpnを導入してみます。

ipアドレスの設定をします。

```
# vi /etc/network/interfaces
iface eth0 inet manual
 
auto br0
iface br0 inet static
address 192.168.0.20
netmask 255.255.255.0
network 192.168.0.0
broadcast 192.168.0.255
gateway 192.168.0.1
bridge_ports eth0
bridge_maxwait 10
```

そして再起動

起動した後に確認

```
ifconfig
```

ちゃんとできてそうです。
そしてとうとうソフトをインスコ。

```
cd
mkdir src
cd src
wget http://jp.softether-download.com/files/softether/v4.20-9608-rtm-2016.04.17-tree/Linux/SoftEther_VPN_Server/32bit_-_ARM_EABI/softether-vpnserver-v4.20-9608-rtm-2016.04.17-linux-arm_eabi-32bit.tar.gz
tar zxf softether-vpnserver-v4.20-9608-rtm-2016.04.17-linux-arm_eabi-32bit.tar.gz
cd vpnserver
make
```

利用規約に同意するかどうか聞かれるので1を入力、からのエンター。ずら～っと出てくるのでまた1を入力。エンター。また1を入力。エンター。
どうやら完了したようです。
ソフトをusr/localに移動させます。

```
cd ../
mv vpnserver /usr/local/
```

そして権限を変更します。

```
chmod /usr/local/vpnserver
chmod 700 ./vpncmd
chmod 700 ./vpnserver
```

そのあと起動スクリプトを作らねばならないようですが、さっぱりわからないのでコピペ。

```
# vi /etc/init.d/vpnserver
 
#!/bin/sh
### BEGIN INIT INFO
# Provides:       vpnserver
# Required-Start: $local_fs $network
# Required-Stop:  $local_fs $network
# Default-Start:  2 3 4 5
# Default-Stop:   0 1 6
# Description:    SoftEther VPN Server
### END INIT INFO
 
DAEMON=/usr/local/vpnserver/vpnserver
LOCK=/var/lock/vpnserver
 
vpn_start() {
${DAEMON} start
}
 
vpn_stop() {
${DAEMON} stop
}
 
test -x ${DAEMON} || exit 0
 
case "$1" in
start)
vpn_start
touch ${LOCK}
;;
stop)
vpn_stop
rm ${LOCK}
;;
restart)
vpn_stop
sleep 3
vpn_start
;;
*)
echo "Usage: $0 {start|stop|restart}"
exit 1
esac
 
exit 0
```

そしてchkconfigとやらをインストール、設定、起動。

```
apt-get install chkconfig
chkconfig --add vpnserver
/etc/init.d/vpnserver start
```

あれれ、許可がないと怒られたので許可をします。

```
chmod +x /etc/init.d/vpnserver
/etc/init.d/vpnserver start
```

できました！
ということでここからはほかのパソコンからguiで遠隔設定できるのでそれに頼ります。

http://jp.softether-download.com/files/softether/v4.20-9608-rtm-2016.04.17-tree/Windows/Admin_Tools/VPN_Server_Manager_and_Command-line_Utility_Package/softether-vpn_admin_tools-v4.20-9608-rtm-2016.04.17-win32.zip

これをダウンロード、解凍、vpnsmgr.exeを起動。
新しい接続設定→接続設定名に適当名前、ホスト名にラズパイのip→OK。
一覧に表示されるので、選択して接続。
新しいパスワードを決めろ、と出てきたので入力。
すると簡易セットアップが起動。
リモートアクセスvpnサーバーを選択、次へ。
初期化するけどいいか聞いてくるのではいを選択。
任意の名前を入れろと出てきたのでVPNと入れてOK。
ダイナミックDNS名を適当に決めて(後で使うらしい)、というかそのままで閉じるをクリック。
L2TPサーバー機能を有効にするにチェックを入れて、右真ん中らへんのやつはVPNに、下の事前共有鍵とやらはパスワードらしいので入力、OKをクリック。
VPN Azureは使わないので、無効をクリックしてOK。
ユーザーを作成する、をクリック。
ユーザー名、パスワードを入力、OKをクリック。
ユーザーの管理が出てくるので、閉じるをクリック。
戻ってくるので、ローカルブリッジをbr0かeth0どちらでもいいので選択、閉じる。
左下の、ローカルブリッジ設定をクリック。
VPNを選択し、ローカルブリッジの削除、をクリック。
仮想HUB名にVPN、作成する種類は、新しいtapデバイスとのブリッジ接続を選択、新しいtapデバイス名にvlanを入力し、ローカルブリッジを追加をクリック。閉じるをクリック。
管理画面に戻ったら、VPNを選択し、仮想HUBの管理をクリック。
以後、管理はここからできるらしいです。
閉じる、をクリックで戻り、暗号化と通信関係の設定をクリック。暗号化アルゴリズム名をDHE-RSA-AES256-SHAに変更、OKをクリックして戻ってきます。
OpenVPN/MS-SSTP設定をクリック、OpenVPNサーバー機能を有効にする、MS-SSTP VPNサーバー機能を有効にするのチェックをともに外し、OKをクリック。
以上で、windowsでの操作は終了です。
ラズパイに戻ります。

```
chkconfig --del vpnserver
vi /etc/init.d/vpnserver
```

以下のように変更します。

```
#!/bin/sh
### BEGIN INIT INFO
# Provides:       vpnserver
# Required-Start: $local_fs $network
# Required-Stop:  $local_fs $network
# Default-Start:  2 3 4 5
# Default-Stop:   0 1 6
# Description:    SoftEther VPN Server
### END INIT INFO
 
DAEMON=/usr/local/vpnserver/vpnserver
LOCK=/var/lock/vpnserver
 
vpn_start() {
        ${DAEMON} start
        sleep 2
        tap=`/sbin/ifconfig -a| awk '$1 ~ /^tap/ {print $1}'` tap=`/sbin/ifconfig -a| awk '$1 ~ /^tap/ {print $1}'`
        brctl addif br0 ${tap}
}
 
vpn_stop() {
        ${DAEMON} stop
}
 
test -x ${DAEMON} || exit 0
 
case "$1" in
start)
        vpn_start
        touch ${LOCK}
        ;;
stop)
        vpn_stop
        rm ${LOCK}
        ;;
restart)
        vpn_stop
        sleep 3
        vpn_start
        ;;
*)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac
 
exit 0
```

再度登録し有効にします。そして再起動。

```
chkconfig --add vpnserver
chkconfig vpnserver on
reboot
```

ifconfigをするとtap_vlanというのが表示されています。成功！

では実際にPCから接続できればおわりです。

以上！

