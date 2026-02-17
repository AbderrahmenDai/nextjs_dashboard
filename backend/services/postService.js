const { Post, Department } = require('../models');

const getAllPosts = async ({ departmentId, status } = {}) => {
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const posts = await Post.findAll({
        where,
        include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name', 'site']
        }],
        order: [['createdAt', 'DESC']]
    });

    return posts.map(p => {
        const plain = p.get({ plain: true });
        return {
            ...plain,
            departmentName: plain.department ? plain.department.name : null,
            site: plain.department ? plain.department.site : null
        };
    });
};

const getPostById = async (id) => {
    const post = await Post.findByPk(id, {
        include: [{
            model: Department,
            as: 'department'
        }]
    });
    
    if (!post) return null;

    const plain = post.get({ plain: true });
    return {
        ...plain,
        departmentName: plain.department ? plain.department.name : null,
        site: plain.department ? plain.department.site : null
    };
};

const createPost = async (data) => {
    return await Post.create(data);
};

const updatePost = async (id, data) => {
    await Post.update(data, { where: { id } });
    return await getPostById(id);
};

const deletePost = async (id) => {
    await Post.destroy({ where: { id } });
    return { message: 'Deleted' };
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};
