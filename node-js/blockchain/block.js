const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');
// DIFFICULTYの周りに {} が付いてる理由がわからない

class Block{
    constructor(timestamp,lastHash,hash,data, nonce, difficulty){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }


    // デバック用

    toString(){
        return `Block
        Timestamp : ${this.timestamp}
        lasthash  : ${this.lastHash.substring(0,10)}
        hash      : ${this.hash.substring(0,10)}
        nonce     : ${this.nonce}
        difficulty: ${this.difficulty}
        data      : ${this.data}`;
    }

    // ジェネシスブロック生成
    static genesis(){
        return new this("timestamp","---", "h4r0-j12",[],0);
    }

    // ブロックを生成
    static mineBlock(lastBlock, data){
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let timestamp,hash;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = this.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        } while (hash.substring(0,difficulty) !== '0'.repeat(difficulty));

        return new Block(timestamp, lastHash, hash, data, nonce, difficulty);
        // const timestamp = Date.now();
        // const lastHash = lastBlock.hash;
        // const hash = Block.hash(timestamp,lastHash,data);

        // return new Block(timestamp,lastHash,hash,data);
    }

    static hash(timestamp, lastHash, data,nonce, difficulty){
        return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block){
        const {timestamp, lastHash, data,nonce, difficulty} = block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime){
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty +1 : difficulty -1 ;
        return difficulty;
    }
}

module.exports = Block;