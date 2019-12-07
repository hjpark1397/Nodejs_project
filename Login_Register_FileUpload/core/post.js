/*사진과 글 테이블에 저장 */
const pool = require('./pool')

function Post();//post 함수선언

Post.prototype ={

    saveText : function(body, callback)
    {
        var content = body.postContent;
        console.log(content);
//put values in an array called bind

        var bind = [];

        for(prop in body){//loop in the attributes of the object and push the values into the bind array
            bind.push(body[prop]);
        }
//값을 sql에 넣는 부분
        let sql = `INSERT INTO users (postIMG, postContent) VALUES (?, ?)`;

        pool.query(sql, bind, function(err, result) {
            if(err) throw err;
            //return the last inserted
            callback(result.insertId)
        });
    }

}

module.exports = Post;