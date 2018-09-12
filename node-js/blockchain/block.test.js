const Block = require('./block');

describe('Block', () => {
    // Function内部にスコープを広げるためletで定義
    // letは、関数スコープのvarと異なりブロックスコープなので更新されない
    let data, lastblock, block;

    // まずテストデータの初期化
    beforeEach( () => {
        data = "yoda";
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock, data);  //ブロック生成
    });

    it('data test', () => {
        expect(block.data).toEqual(data);
    });
    
    it('hash test', ()　=> {
        expect(block.lastHash).toEqual(lastBlock.hash);
    })

    it('指定難易度のハッシュ値生成テスト', () => {
        expect(block.hash.substring(0,block.difficulty)).toEqual('0'.repeat(block.difficulty));
        console.log(block.toString());
    })

    it('低速ブロックで難易度を下げる', () => {
        expect(Block.adjustDifficulty(block, block.timestamp + 360000)).toEqual(block.difficulty-1);
    })

    it('高速ブロックで難易度を下げる', () => {
        expect(Block.adjustDifficulty(block, block.timestamp + 1)).toEqual(block.difficulty+1);
    })

    // itー１つ目のパラメーターでテスト名、2つ目のパラメーターで処理内容を記述。

});