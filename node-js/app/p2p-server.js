const Websocket = require('ws');
// P2Pポート番号を実行環境から呼び出す
const P2P_PORT = process.env.P2P_PORT || 5001;
/* 接続先サーバー一覧　（三項演算子を利用　前者がtrueの場合で後者がfalseの場合の処理）
    実行環境で接続先をカンマ区切りで複数指定できるようにし。
    splitでカンマを起点に全ての接続先サーバーを配列に変換
    接続先がなければ空の配列
*/
const peers = process.env.PEERS ? process.env.PEERS.split(',')　: [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transaction: 'CLEAR_TRAMNSANCTION'
};

class P2pServer{
    constructor(blockchain, transactionPool){
        // ブロックチェーン、ソケット一覧を初期化
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }



    // サーバー応答待機処理
    listen(){
        // サーバーを生成
        const server = new Websocket.Server( { port : P2P_PORT });
        // コネクションイベント処理
        server.on('connection', socket => this.connectSocket(socket));
        this.connectPeers();
    }

    connectPeers(){
        peers.forEach( peer => {
            // P2Pサーバーリストの全てのサーバーに対してソケットを開く処理
            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    // ソケットを追加する
    connectSocket(socket){
        this.sockets.push(socket);
        console.log('Socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
        // ソケットのデータを送る
        socket.send(JSON.stringify(this.blockchain.chain));
    }

    sendChain(socket){
        socket.send(JSON.stringify(this.blockchain.chain));
    }

    syncChains(){
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data =  JSON.parse(message);
            switch(data.type){
                case MESSAGE_TYPES.chan:
                    this.blockchain.replaceChain(data);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transaction:
                    this.transactionPool.clear();
                    break;
            }
            console.log('data', data);
        });
    }

    broadcastTransaction(transaction){
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransactions(){
        this.sockets.forEach(socket => socket.send(
            JSON.stringify( {
                type: MESSAGE_TYPES.clear_transaction
            })
        ));
    }
}

module.exports = P2pServer;