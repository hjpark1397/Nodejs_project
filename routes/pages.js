const express = require('express')
const User = require('../core/user')//user테이블과 연결
const router = express.Router()
const mysql = require('mysql')

const pool = mysql.createPool({//diary라는 db 사용
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'test1234',
    database: 'diary'
});

//create an object from the class in the file core/user.js
const user = new User();

//get index page
router.get('/', (req, res, next)=>{
    let user = req.session.user;
    if(user){
        res.redirect('/home');
        return;
    }
    //인덱스 페이지에 암것도 안보낼때
    res.render('index', {title: "Doongs Diary"})
})

//get home page
router.get('/home', (req, res, next) => {

    let user = req.session.user;
    
    if(user){
        res.render('home', {opp:req.session.opp, name:user.fullname })
        return;
    }
    res.redirect('/');
})

//Post login data
router.post('/login', (req, res, next)=>{
    user.login(req.body.username, req.body.password, function(result){
        if(result){//우리가 로그인해서 세션을 만들고 , 사용자 정보를 임시로 저장한다.
            //user 정보를 session에 저장한다.
            req.session.user = result;
            req.session.opp = 1; //opp: 1 for login 0 for register
            //홈페이지로 리다이렉트
            res.redirect('/home')//로그인을 하면 홈으로 간다.

          //  res.send('Logged in as : ' + result)
        } else{
            res.send('Username/Password incorrect')
        }
    })
})

//회원가입 페이지 라우팅
router.get('/join', (req, res, next)=>{//그려줄때는 render 전송시 redirect
        res.render('join');
})

//if the user submit the register form
//Post register data
router.post('/register', (req, res, next)=>{//등록을 하면 저장이 되고, Welcome 문구가 뜬다.
    let userInput = {
        username: req.body.username,
        fullname: req.body.fullname,
        password: req.body.password
    };

    user.create(userInput, function(lastId){
        if(lastId){

            user.find(lastId, function(result){//user가 있으면 홈으로 로그인 완료 상태
                req.session.user = result;
                req.session.opp = 0;
                res.redirect('/home')
            })


          //  res.send('Welcome ' + userInput.username)

        } else{
            console.log('Error creating a new user...')
        }
    })
})

//Get logout
router.get('/logout', (req, res, next) => {//로그아웃을 하면 세션을 종료시키고 메인 화면으로 돌아간다.
    if(req.session.user){
        req.session.destroy(function() {
            res.redirect('/');
        });
    }
});

//Get list
router.get('/list', (req, res, next)=>{//리스트 페이지로 보내준다.
    res.render('list');
})

//post diary (다이어리 저장 요청)
router.post('/diarycontent', (req, res, next)=>{

    let diary = {
        diaryContent : req.body.diaryContent
    };

    pool.getConnection((error, conn)=>{
        //쿼리문 작성, 실행
     conn.query('INSERT IGNORE INTO diary (diaryContent) VALUES (?)'
             , req.body.diaryContent , (err, result)=>{
         if(error){
             console.log(error);
             res.end();
        //list로 이동요청     
         }else{
             res.render('list');
         }
     });
 });


 function getConnection() {
    return pool
    }

})

//diary 저장된 글 db값 리스트로 가져오기
router.get('/diarycontent', (req, res)=>{
    pool.getConnection(function(error, con){
        con.query('SELECT * FROM diary', function(error, result){
            console.log('gdgdg')
            res.render('list', {rows: rows})//출력
            con.release();
        })
    })
})
module.exports = router;