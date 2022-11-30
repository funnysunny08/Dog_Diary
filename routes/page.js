const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  next();
});

router.get('/profile', (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
});

//* 로그인
router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('login', { title: '로그인' });
});

//* 회원가입
router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입' });
});

//* 홈화면
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick', 'dogName'],
      },
    });

    res.render('main', {title: '홈화면', posts});

  } catch (error) {
    console.error(error);
    next(error);
  }
});

//* 마이페이지
router.get('/mypage', isLoggedIn, async (req, res) => {
    res.render('mypage', { title: '마이페이지' });
});

//* 내개
router.get('/mydog', async (req, res) => {
    res.render('mydog', { title: '내개' });
});

//* 니개
router.get('/yourdog', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('yourdog', { title: '니개', posts: posts });
  } catch (err) {
    console.error(err);
    next(err);
  }    
});

//* 글 작성 페이지로 이동
router.get('/post', async (req, res) => {
  res.render('post', { title: '글 작성' });
});

module.exports = router;