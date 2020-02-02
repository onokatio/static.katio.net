---
title: Plasma , Plasma Cash, Plasma XT, Plasma Prime, Plasma Snark
tags: Ethereum
author: onokatio
slide: false
---
Plasmaに関して。
https://scrapbox.io/cryptoeconimicslab/Plasma%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

# Plasma

特定のチェーンにあるトークンやNFTを、別のチェーンに移動して扱う仕組み。
便宜上、トークンが生成されたチェーンを親チェーン、移動した先のチェーンを子チェーンと呼ぶ。
（なぜなら、階層的に移動ができるため、親子関係として扱うのが理解しやすい。

Plasmaは技術の名前で、実装や実現方法が複数ある。

- **Plasma MVP** Omise GOが実装したMinimal Viable Plasma（実現するための最小限の実装）
- **Plasma Cash** Plasma MVPの容量問題を、UXTOからStateにすることで解決した実装
- **Plasma XT** 
- Plasma Prime
- Plasma Snark
- Plasma Chamber

## 3行で

- 親チェーンにコントラクトを作り、小チェーンのブロックやトランザクションを定期的に読み込ませる
- 親でコントラクトにデポジット（送金）すると、デポジットされたトークンはロックされ、小チェーン側でその分のトークンが新規発行され、もらえる
- 小チェーン側でexit（小チェーンのトークンを親チェーンに戻すこと）要求をすると、親チェーン側で署名の検証などがされ、特に問題がない場合ロックされた分を得られる

→ 取引価格1:1で2 way pegされて常に検証可能なサイドチェーン


※例外的に、ERC20/721トークンを扱ったり、コントラクトのステートをやり取りできるものもあるが、今回は割愛

