var express = require('express');
var router = express.Router();



const authApi = require('./auth.api');
router.use('/auth', authApi);
const userApi = require('./user.api');
router.use('/users', userApi);
const friendApi = require('./friend.api');
router.use('/friends', friendApi);
const commentApi = require('./comment.api');
router.use('/comments', commentApi);
const reactionApi = require('./reaction.api');
router.use('/reactions', reactionApi);
const postApi = require('./post.api');
router.use('/posts', postApi);


module.exports = router;
