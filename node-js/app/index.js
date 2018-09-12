const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const P2pServer = require('./p2p-server');
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();

app.use(bodyParser.json());

const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

// jsonファイルでブロックの情報を呼び出す
app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`ブロックが追加されました。 ${block.toString()}`);
    p2pServer.syncChains();
    res.redirect('/blocks');
});

// 'transactionsというのはURLを指す
app.get('/transactions', (req, res) => {
    　res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount,bc,  tp);
    res.redirect('/transactions');
});

app.get('/public-key', (req, res) => {
    res.json({publickey : wallet.publicKey});
});

app.get('/mine-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`ブロックが生成されました。 ${block.toString()}`);
    res.redirect('/blocks');
})

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));

//listen処理ー応答待機処理
p2pServer.listen();