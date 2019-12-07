const express = require('express')
const session = require('express-session')//세션 연결
const multer  = require('multer')//사진 업로드 모듈
const path = require('path')
const pageRouter = require('./routes/pages')//routes내의 pages와 연결
const mysql = require('mysql')
const fs = require('fs')
const logger = require('morgan')
require('dotenv').config();//env파일 사용



//init app
const app = express();


//Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){//cb : callback
        cb(null, file.fieldname + '-' + Date.now() +
         path.extname(file.originalname));//저장될 파일명 설정
    }
});

//init Upload
const upload = multer({
    storage: storage,//저장소
    limits:{filesize: 1000000},//파일 용량
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('myImage');

//Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;//지정된 확장자의 파일만 업로드 가능함
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else{
        cb('Error: Images Only!');//오류 메시지 출력
    }
}

//for body parser
app.use(express.urlencoded({ extended : false }))


//css, image, js files
app.use(express.static(path.join(__dirname, 'public')))

//public directory
app.use(express.static('./public'));


//template engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')//pug 설정

app.post('/upload', (req, res) => {
    // res.send('test') submit 버튼 작동 확인
    upload(req, res, (err) => {
        if(err){//error check
             res.render('home', {
                 msg: err
             });
        } else {//에러 없을 경우
             // console.log(req.file)//파일을 출력해주고
             // res.send('test');//체크
             // 이제 업로드 한 파일을 보여주는 부분을 할 것이다!
             if(req.file == undefined){
                 res.render('home', {
                     msg: 'Error: No File Selected!'
                 });
             } else{
                 res.render('home', {
                     msg: 'File Uploaded!',
                     file: `uploads/${req.file.filename}`
                 });
             }
        }
    });
 });



// session
app.use(session({
    secret: process.env.COOKIE_SECRET,//이곳은 dotenv 파일로 빼놨다.
    resave: true,
    saveUninitialized: false,
    cookie:{
        maxAge: 60 * 1000 * 30,
        httpOnly: true,
        secure: false
    }

}))


//routers
app.use('/', pageRouter)


//errors : page not found 404
app.use((req, res, next) =>{
    const err = new Error('Page not found')
    err.status = 404
    next(err)
})

//handling errors
app.use((err, req, res, next)=>{
    res.status(err.status || 500)
    res.send(err.message)
})
// // server index page
// app.get('/', function(req, res) {
//     res.render('index')
// })


// setting up the server
app.listen(3000, () =>{
    console.log('Server is running on port 3000') //port number 3000
})

module.exports = app