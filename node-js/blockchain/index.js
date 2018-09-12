const Block = require('./block');

class Blockchain {
    constructor(){
        this.chain = [Block.genesis()];  //ジェネシスブロックを追加
    }

    // 新しくチェーンを追加
    addBlock(data){
        const lastBlock = this.chain[this.chain.length -1];
        const block = Block.mineBlock(lastBlock, data);
        
        this.chain.push(block);

        return block;
    }

    isValidChain(chain){
        // JSON.stringifyでオブジェクトの内容を文字列に変換
        // ジェネシスブロックは常に正しい必要がある
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;

        for (let i = 1; i < chain.length; i++){
            const block = chain[i];
            const lastBlock = chain[i-1];

            // ブロックが改竄されていれば以下の処理はfalseになる
            if (block.lastHash !== lastBlock.hash ||
                block.hash !== Block.blockHash(block)){
                return false;
            }
        }
        return true;
    }

    replaceChain(newChain){
        if (newChain.length <= this.chain.length) {
          console.log("ブロック数不足のため省略します");
          return;
        } else if (!this.isValidChain(newChain)) {
          console.log("ブロックチェーンデータ不備のため省略");
          return;
        }
        console.log("最新ブロックチェーンデータに更新します");
        this.chain = newChain;
    }
}

module.exports = Blockchain;
