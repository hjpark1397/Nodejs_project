//Connect to the database
const util = require('util')
const mysql = require('mysql')
/*  Connection to the database*/
const pool = mysql.createPool({//diary라는 db 사용
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'test1234',
    database: 'diary'
});

pool.getConnection((err, connection)=>{//데이터 베이스에 연결이 되지 않았을 때
    if(err)
        console.error("Something went wrong connecting to the database...");

    if(connection)
        connection.release();
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;