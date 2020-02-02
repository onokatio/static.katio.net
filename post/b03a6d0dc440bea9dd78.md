---
title: 僕がピチピチJCの時に作ったガバガバdocker管理ソフトを晒す
tags: Docker シェルスクリプト
author: onokatio
slide: false
---
```sh:docker-manger
#!/bin/bash

while true ; do
        echo -e "\n\n\n\n\n########################################イメージ（起動ディスク）一覧########################################"
        docker images
        echo -e "\n\n########################################コンテナ（仮想マシン）一覧########################################"
        docker ps -a
        echo -e "\n1 コンテナを起動する  2 コンテナを一時停止する  3 コンテナのシェルに接続  4 ファイルを送信・受信  5 ファイルを同期  6 コンテナの削除 0 終了"
        echo -e -n "\n番号を入力してください > "
        read -s -n1 char
        echo $char
        if [[ $char == 1 ]]; then

                echo -ne "\nコンテナID またはコンテナName を入力してください > "

                read char
                docker start $char

        elif [[ $char == 2 ]]; then

                echo -ne "\nコンテナID またはコンテナName を入力してください > "

                read char
                docker stop $char

        elif [[ $char == 3 ]]; then

                echo -ne "\nコンテナID またはコンテナName を入力してください > "

                read char
                echo -e "\n==exitと打つことでコンテナを起動したまま抜けられます。==\n\n"

#               docker exec -it $char /bin/bash
                docker attach $char

        elif [[ $char == 4 ]]; then
                char="";
                while [[ $char != 1 ]] && [[ $char != 2 ]] ; do
                        echo -ne "\n1 ホストマシン→仮想マシン  2 仮想マシン→ホストマシン > "
                        read -n1 char
                        if [[ $char != 1 ]] && [[ $char != 2 ]] ; then
                                echo -e "\n1または2を入力してください\n"
                        fi
                done

                echo -ne "\n\n送信または受信するコンテナID またはコンテナName を入力してください > "
                read cont

                echo -ne "\n\n送信するファイルの絶対パスを入力してください > "
                read fpath

                echo -ne "\n\n送信するファイルの絶対パスを入力してください > "
                read fpath

#               if [[ $char == 1 ]]; then
#                       docker cp
#               elif [[ $char == 2 ]]; then

#               else
#               fi
                #docker exec -it $char /bin/bash

        elif [[ $char == 0 ]]; then

                exit 0

        fi
        char=""
done
```


以上

