#!/usr/bin/env node
//
// SMSから日本語テキストのメッセージを受けて、
// NLCで自然言語分類して、リピートする
// Maho Takara
//
// 2016/5/1  初版
// 2016/5/20 Twitter バージョン
// 2016/6/21 LINE API BOTバージョン
// 2016/7/28 NLCを２段階から1段階へ変更
// 2016/8/2  node v4.4.7 に対応　それまでは、v0.12.12
// 2016/8/4  端末相手ごとに、切り分けるセッション管理追加
// 2016/8/8  大幅にフィファクタリング
//

// 共通
var fs = require('fs');
var async = require('async');
var watson = require('watson-developer-cloud');

// LINE BOTの初期化
var LineBot = require('line-bot');
var line_crd = require('./line_api_credential.json');
var linebot = new LineBot(line_crd);

// Watson NLC
var cnf_nlc = require('./nlc/nlc_config.json');
var pra_nlc = require('./nlc/nlc_id.json');
var crd_nlc = require('./nlc/watson_nlc_credentials.json');
var nlc = watson.natural_language_classifier(crd_nlc.credentials);

// Watson Dialog
var dialog_cnf  = require('./dialog/dialog_config.json');
var dialog_auth = require('./dialog/watson_dialog_credentials.json');
var dialog = watson.dialog(dialog_auth.dialog[0].credentials);

// Watson RR
var rr_cnf   = require('./rr/rr_config.json');
var rr_pra   = require('./rr/cluster_id.json');
var rr_auth  = require('./rr/watson.rtrv_rank.auth.json');
var rr = watson.retrieve_and_rank(rr_auth.credentials);
var qs = require('qs');

// 時間
var moment = require("moment");

// Cloudantへの接続
var cred = require('./cloudant_credentials_id.json');
var Cloudant = require('cloudant')
var cloudant = Cloudant(cred.credentials.url);

// 反応データベース
var dbname = "reactions";
var pdb = cloudant.db.use(dbname);

// 天気取得機能
var weather = require('./weather_report/libweather2.js');


// ラインAPI
var line_api = require('./line_api/lib_line_api.js');


// 動作モード
//  0: チャットモード、 1: 学習モード
var nlc_chat_mode = 1;
var dialog_mode =  2;
var session = {};  // セッション情報、配列で全体を保有


//=============================================

/*
 LINE BOT API メッセージ受信
*/
linebot.on('message', function (msg) {
    date = new Date(msg.result[0].content.createdTime);
    time = date.toLocaleString()
    write_log("=== EVENT RECIVE (time:" + time + ") ===");

    async.series([
	// プロファイルを毎回取得しなくても良い様にするため、asyncを入れる
	function(callback) {
	    //セッションが無い時は、プロファイルを取得する
	    if (session[msg.result[0].content.from] == undefined ) {
		console.log("EVENT: new session");
		// メッセージ送信相手の情報取得
		linebot.getProfile(msg.result[0].content.from,function(err,profile) {
		    session[msg.result[0].content.from]
			= { count: 0, 
			    mode: nlc_chat_mode,
			    profile: profile,
			    start_time: time,
			    last_time: time
			  };
		    callback(null);
		});
	    } else {
		session[msg.result[0].content.from].count++;
		session[msg.result[0].content.from].last_time = time;
		callback(null);
	    }
	}],function(err, results) {
	    // テキスト
	    if ( msg.result[0].content.contentType == 1) {
		write_log("=== LINEからテキスト受信 ===");
		write_log("メッセージ:" + msg.result[0].content.text);

		watson_input_data = {
		    text: msg.result[0].content.text,
		    date: msg.result[0].content.createdTime,
		    from: msg.result[0].content.from
		};

		session[msg.result[0].content.from].input_text 
		    = msg.result[0].content.text;
		session[msg.result[0].content.from].input_from
		    = msg.result[0].content.from;
		
		// Watson Chat Bot メイン
		watson_chatbot_main(session[msg.result[0].content.from],
				    function(err,watson_ans) {
					// 送信元へメッセージ送信
					linebot.sendMessage(
					    msg.result[0].content.from,
					    watson_ans.phrase);
					console.log(session[msg.result[0].content.from]);
				    });
		
	    }
	    // 画像
	    else if ( msg.result[0].content.contentType == 2) {
		write_log("=== LINEから画像受信 ===");
		console.log(msg.result[0].content);
		linebot.getContent(msg.result[0].content.id,"test.jpg");
	    }
	    // 音源
	    else if ( msg.result[0].content.contentType == 4) {
		write_log("=== LINEから音源受信 ===");
		console.log(msg.result[0].content);
	    }
	    // スタンプ
	    else if ( msg.result[0].content.contentType == 8) {
		write_log("=== LINEからスタンプ受信 ===");
		console.log(msg.result[0].content);
	    }
	    // その他
	    else {
		write_log("=== LINEからその他受信 ===");
		console.log(msg.result[0].content);
	    }
	});
});


/*
  Watson Chat Bot メイン処理
     NLCにかけて、その後の処理を選択する
     処理モード
       NLCチャットモード（デフォルト）
       DIALOGモード
       NLCの結果で、DIALOGモードに切り替える
 */
function watson_chatbot_main( session_handle, callback) {

    if (session_handle.mode == dialog_mode) {
	// ダイアログ（対話）機能
	watson_dialog(
	    session_handle,
	    function(err,dialog_ans) {
		if (err) {throw err;}
		write_log("ワトソン> " + dialog_ans.phrase);
		callback(err,dialog_ans);
	    });
	
    } else {
	// 自然言語分類
	watson_nlc(
	    session_handle,
	    function(err,nlc_ans) {
		write_log("ワトソン> " + nlc_ans.phrase);
		callback(err,nlc_ans);
	    });
    }
}

/*
  Watson NLC 自然言語分類と対応処理
*/
function watson_nlc(session_handle,callback) {
    pra_nlc.text = session_handle.input_text;
    nlc.classify( pra_nlc, function(err, resp) {
	if (err) {
	    write_log("error:", err);
	    callback(err,null);
	} else {
	    for(var i = 0;i < resp.classes.length; i++) {
		write_log("class_name " + resp.classes[i].class_name);
		write_log("confidence " + resp.classes[i].confidence);
	    }
	    if (resp.classes[0].confidence > 0.5) {
		take_action(session_handle, resp.classes[0].class_name, function(err,reply) {
		    callback(err,reply);
		});
	    } else {
		pst = parseInt(resp.classes[0].confidence * 100);
		msg = "確度 " 
		    + pst + "％で「" 
		    + resp.classes[0].class_name
		    + "」と推定されますが、"
		+ "確度が低いので、別の言い方でお願いします。"
		callback(null, { phrase: msg });
	    }
	}
    });
}


// ログファイルへ書き込み
function write_log(data) {
    console.log(data);
    write_buf = data + '\n';
    fs.appendFileSync('watson_nlc_log.txt', write_buf ,'utf8');
}

// Intの乱数を返す 0からmaxまで
function getRandomInt(max) {
    return Math.floor( Math.random() * max );
}


/*
  対応アクションの検索結果に基づき応答を実施する
*/
function take_action(session_handle,nlc_result,callback) {

    // データベースからアクションを決定
    pdb.find( {"selector": {"class": nlc_result}} ,function(err, body) {
	if (err) {
	    write_log("find error:", err);
	    callback(err,null);
	}
	write_log("検索結果ヒット数 = " + body.docs.length);

	/*
	  NLCの分類結果からアクションを決める
	  ヒットした解答候補の中から乱数で選択する
	  外部機能があれば実行して、応答メッセージを決める
	 */
	if (body.docs.length) {
	    // 検索結果から反応を決める
	    var candidate_reply = [];     // 応答フレーズ候補
	    var candidate_reply_i = 0;    // 候補配列添字 応答
	    var candidate_function = [];  // 外部機能候補
	    var candidate_function_i = 0; // 候補配列添字 機能
	    var candidate_dialog = [];    // Dialog候補
	    var candidate_dialog_i = 0;   // Dialog候補配列添字 
	    var candidate_rr   = [];      // RR候補
	    var candidate_rr_i = 0;       // RR候補配列添字 


	    for (var i = 0; i < body.docs.length; i++) {
		console.log("dialog reply = ", body.docs[i].dialog_name);

		// 応答フレーズは必ず登録されているとする
		// 解答候補の配列にセット
		write_log("phrase = " + body.docs[i].reply_phrase);
		candidate_reply[candidate_reply_i++] = body.docs[i].reply_phrase;

		// 外部機能のコール先を登録
		if (body.docs[i].reaction.length > 0) {
                    write_log("function = " + body.docs[i].reaction);
		    candidate_function[candidate_function_i++] = body.docs[i].reaction;
                }

		// Dialog を登録
		if (body.docs[i].dialog_name.length > 0) {
                    write_log("dialog_name = " + body.docs[i].dialog_name);
		    candidate_dialog[candidate_dialog_i++] = body.docs[i].dialog_name;
                }

		// RR を登録
		if (body.docs[i].rr_name.length > 0) {
                    write_log("rr_name = " + body.docs[i].rr_name);
		    candidate_rr[candidate_rr_i++] = body.docs[i].rr_name;
                }
	    }

	    /*
	     乱数で反応を決定
	       経験知,感情,相手の様子から反応を決められると良いが。。。
	    */
	    // 外部関数があれば優先する
	    if (candidate_function_i > 0) {
		var decided_function_i = getRandomInt( candidate_function_i );
		eval( candidate_function[decided_function_i]
		      + "(session_handle,function(err,rsp){callback(err,rsp)});");
	    } else if ( candidate_reply_i > 0) {
		// ダイアログを選択
		var decided_reply_i = getRandomInt( candidate_reply_i );
		if ( candidate_dialog_i > 0) {
		    session_handle.mode = dialog_mode;
		    var decided_dialog_i = getRandomInt( candidate_dialog_i );
		    session_handle.dialog = {
			input: session_handle.input_text,
			name: candidate_dialog[decided_dialog_i]
		    };
		    watson_dialog(
			session_handle,
			function(err,dialog_ans) {
			    if (err) {throw err;}
			    callback(err,dialog_ans);
			});
		} else if ( candidate_rr_i > 0) {
		    session_handle.rr_name = candidate_rr[getRandomInt(candidate_rr_i)];
		    watson_rr(
			session_handle,
			function(err,ans) {
			    if (err) {throw err;}
			    callback(err,ans);
			});
		}
		callback(null, {phrase : candidate_reply[decided_reply_i]});
	    } else {
		callback(null, {phrase : 'なんと反応して良いか解りません'});
	    }
	} else {
	    callback(null, {phrase : 'リアクションDBに反応候補がありません'});
	}
	console.log("DEBUG action_reply L2 を抜けたぞ");
    });
    console.log("DEBUG action_reply L1 を抜けたぞ");
}


// Dialog を利用した会話処理本体
function watson_dialog(session_handle, callback) {

    if (session_handle.dialog == undefined)  {
	session_handle.dialog 
	    = { name: session_handle.dialog_name,
		input: session_handle.input_text }
    } else {
	session_handle.dialog.input = session_handle.input_text;
    }


    // DIALOGサービスの名称からインスタンスのIDを取得する
    dialog.getDialogs({}, function(err, resp) {
	if (err) {
	    console.log("error =", err);
	    return;
	}

	if (resp.dialogs.length == 0) {
	    console.log("Not found dialog");
	    return;
	}

	var dialog_id = null;
	for (var i = 0; i < resp.dialogs.length;i++) {
	    if ( resp.dialogs[i].name == session_handle.dialog.name) {
		dialog_id = resp.dialogs[i].dialog_id;
		break;
	    }
	}

	if (dialog_id == null) {
	    console.log("Not found dialog_name");
	    return;
	}

	var param = {}
	if ( session_handle.dialog.conversation == undefined ) {
	    param = {
		dialog_id: dialog_id,
		input: session_handle.dialog.input}
	} else {
	    param = {
		dialog_id: dialog_id,
		input: session_handle.dialog.input,
		conversation_id: session_handle.dialog.conversation.conversation_id,
		client_id: session_handle.dialog.conversation.client_id
	    }
	}

	// Watson Dialog Service への問い合わせ
	dialog.conversation(param, function(err,conversation_reply) {
	    if (err) {console.log(err); throw err}

	    // Dialogのリプライは、配列を全部連結して、応答
	    reply = "";
	    for (var j=0;j < conversation_reply.response.length; j++) {
		if (conversation_reply.response[j].length > 0) {
		    if (reply.length) {
			reply = reply + "、";
		    }
		    reply = reply + conversation_reply.response[j];
		} else
		    break;
	    }
	    // セッション情報に対話IDを登録するため、情報を返すこと
	    session_handle.dialog.conversation = conversation_reply;
	    callback(null,{ phrase: reply, conversation: conversation_reply});
	    conversation_reply.dialog_id = dialog_id;
	    dialog.getProfile(conversation_reply, function(err, profile) {
		if (err) {
		    console.log(err);
		    throw err;
		}
		console.log("profile = ", profile);

		// Dialog終了を判定して、NLCチャットモードに戻す
		for(var i = 0; i < profile.name_values.length; i++) {
		    if (profile.name_values[i].name == 'Complete' &&
			profile.name_values[i].value == 'Yes') {
			///////////////////////////////////////////////////
			// ここにDIALOG で取得した内容に応じた処理を入れる
			///////////////////////////////////////////////////
			session_handle.mode = nlc_chat_mode;
			delete session_handle.dialog;
		    }
		}
	    });
	});
    });
}
// R&Rを利用した応答
function watson_rr(session_handle, callback) {

    console.log("=========== WATSON RR ===============");

    // ranker id を取得
    rr.listRankers({}, function(err, resp) {
	if (err) {
	    console.log('watson rr error: ', err);
	} else {
	    var rr_id = null;
	    //console.log(JSON.stringify(resp, null, 2));
	    for (var i = 0; i < resp.rankers.length; i++) {
		if (resp.rankers[i].name == session_handle.rr_name) {
		    rr_id = resp.rankers[i].ranker_id;
		    break;
		}
	    }
	    if (rr_id == null) {
		return;
	    }

	    rr_pra.config_name = rr_cnf.config_name;
	    rr_pra.collection_name = rr_cnf.collection_name;
	    rr_pra.wt = 'json';
	    //console.log("rr param = ", rr_pra);

	    var query = qs.stringify({q: session_handle.input_text, ranker_id: rr_id, fl: 'id,title,body'});
	    var solrClient = rr.createSolrClient(rr_pra);
	    solrClient.get('fcselect', query, function(err, resp) {
		if(err) {
		    console.log('Error searching for documents: ' + err);
		    callback(null, { phrase: "該当の回答がありません" });
		}
		else {
		    //console.log(JSON.stringify(resp.response.docs, null, 2));
		    if (resp.response.docs.length > 0) {
			callback(null, { phrase: resp.response.docs[0].body[0] });
		    } else {
			callback(null, { phrase: "該当の回答がありません" });
		    }
		}
	    });
	}
    });
}
