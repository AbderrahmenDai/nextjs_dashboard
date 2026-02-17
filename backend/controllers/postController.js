const asyncHandler = require('express-async-handler');
const postService = require('../services/postService');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
    const { departmentId, status } = req.query;
    const posts = await postService.getAllPosts({ departmentId, status });
    res.json(posts);
});

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
    const post = await postService.getPostById(req.params.id);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    res.json(post);
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { title, departmentId } = req.body;
    if (!title || !departmentId) {
        res.status(400);
        throw new Error('Title and Department ID are required');
    }
    const post = await postService.createPost(req.body);
    res.status(201).json(post);
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
    const post = await postService.updatePost(req.params.id, req.body);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    res.json(post);
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
    await postService.deletePost(req.params.id);
    res.json({ message: 'Post deleted' });
});

module.exports = {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};
