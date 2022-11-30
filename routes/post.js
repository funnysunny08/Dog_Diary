const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 6 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
      title: req.body.title,
    });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//* 글 삭제
router.delete('/:postId', isLoggedIn, async (req, res, next) => {
  const { postId } = req.params;
  try {
    await Post.delete({
      where: {
        id: postId
      }
    });
    res.status(200).send("삭제 성공").redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//* 글 조회
router.get('/:postId', async (req, res, next) => {
  const { postId } = req.params;
  try {
    post = await Post.findByPk(postId);
    res.render('readPost', { title: '니개', post: post });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;