# LINE Chat-Bot on SoftLayer and Bluemix

IBM Watson API を利用した Chat Bot のコードです。


# Bluemix, SoftLayer などのアカウントについて

このコードを実行するためには、次のアカウントが必要です。

- IBM Bluemix	  https://console.ng.bluemix.net/registration/	
- IBM SoftLayer	  https://www.softlayer.com/promo/freeCloud/free-cloud
- LINE BOT API    https://business.line.me/services/products/4/introduction
- OpenWaatherMap  http://openweathermap.org/appid
- Lets Encripts   https://letsencrypt.jp/

Bluemix, SoftLayerは、登録から1ヶ月間は無料で利用できます。また、Bluemixは、毎月の無料枠のを利用して無料で利用する事もできます。


# Nodeのバージョンについて

このChat Bot コードは、foever で バックグランドで 動作させるために node v0.12.9 を使う様に開発しています。 複数のNode.js のバージョンを動かす方法は、Qiita 「node.js のバージョン管理ツール ndenv を試した」(http://qiita.com/MahoTakara/items/8fdebe32e8f326afa7f8) を参照してください。


# Python のバージョンについて

このセットアップ用のコードの一部に、Python 2.7.10 を利用して、開発しています。pyenv を利用して、Linux ディストリビューションに含まれない Python のバージョンをインストールする方法は、Qiita 「pyenv と slcli コマンドをインストールする手順」(http://qiita.com/MahoTakara/items/cbd861112b00da82c95b) の「pyenv の導入と設定」の章を参照してください。


# 前提 Bluemix API サービス について

このアプリケーションを動作させるための Bluemix の API サービスは以下です。

- Watson Natural Language Classifier
- Watson Retrieve and Rank
- Watson Dialog
- Watson Visual Recognition
- Cloudant NoSQL DB

Bluemix にログインして、各インスタンス１個を作成して、サービス資格情報(JSON形式)をコピペできる様にしてくください。 


# ファイルの説明

LICENSE
README.md
watson_chatbot.js

cloudant_credentials_id.json
line_api_credential.json
openweathermap.json
lets_encript.key
lets_encript_fullchain.crt

nlc/
dialog/
rr-solr/
rr1/
rr2/
vr/


line_api/
weather_report/

excel/