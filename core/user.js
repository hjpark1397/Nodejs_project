/* create a user class to send queries to database */

const pool = require('./pool')
const bcrypt = require('bcrypt')//hash the password

function User() {};

User.prototype = {
    // Find user data by id or username.
    find : function(user = null, callback)
    {
        //if user = number return field = id, if user = string return field = username.
        if(user){
            var field = Number.isInteger(user) ? 'id' : 'username';
        }

        let sql = `SELECT * FROM users WHERE ${field} = ?`; //쿼리문 준비


        pool.query(sql, user, function(err, result){
            if(err) throw err

            if(result.length){
                callback(result[0]);
            } else{
                callback(null);
            }
        });
    },

    create : function(body, callback)
    {
        var pwd = body.password;
        console.log(pwd);
        body.password = bcrypt.hashSync(pwd,10);
//put values in an array called bind

        var bind = [];

        for(prop in body){//loop in the attributes of the object and push the values into the bind array
            bind.push(body[prop]);
        }
//유저의 정보를 입력하는 부분
        let sql = `INSERT INTO users (username, fullname, password) VALUES (?, ?, ?)`;

        pool.query(sql, bind, function(err, result) {
            if(err) throw err;
            //return the last inserted id. if there is no error
            callback(result.insertId)
        });
    },
//로그인
    login : function(username, password, callback)
    {
        //find the user data
        this.find(username, function(user) {
            //username이 있다면
            if(user){
                //비밀번호를 매칭해본다.
                if(bcrypt.compareSync(password, user.password)){//일치하는 값이 있으면
                    callback(user);
                    return;
                }
            }
            //username과 password가 틀리면 null값을 반환해준다.
            callback(null);
        });

    }

}

module.exports = User; 