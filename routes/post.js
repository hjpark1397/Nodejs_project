const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

fs.readdir('uploads', (error)=>{
    if(error){
        console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        fs.mkdirSync('uploads');
    }
});

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb){//최종 파일 목적지
            cb(null, 'uploads/');
        },
        filename(req, file, cb){//파일명
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize : 5 * 1024 * 1024},//용량
});
router.post('/img', upload.single('img'),(req, res)=>{//이미지 하나 업로드
    console.log(req.file);
    res.json({url: `/img/${req.file.filename}`});
});

const upload2 = multer();
router.post('/', upload2.none(), async (req, res, next)=>{//게시글 업로드 처리
    try{
        const post = await post.create({
            content: req.body.content,
            img: req.body.url
        });
        res.redirect('/')
    } catch(error){
        console.error(error);
        next(error);
    }
})

module.exports = router