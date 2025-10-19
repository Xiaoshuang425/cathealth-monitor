const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// 获取用户的所有猫咪
router.get('/', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM cats WHERE user_id = ? ORDER BY created_at DESC';
    
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: '获取猫咪列表失败' });
        }
        
        res.json({
            success: true,
            cats: rows
        });
    });
});

// 添加新猫咪
router.post('/', authenticateToken, (req, res) => {
    const { name, breed, age, weight, gender } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: '猫咪名字不能为空' });
    }
    
    const sql = `
        INSERT INTO cats (user_id, name, breed, age, weight, gender) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [req.user.id, name, breed, age, weight, gender], function(err) {
        if (err) {
            return res.status(500).json({ error: '添加猫咪失败' });
        }
        
        res.status(201).json({
            success: true,
            message: '猫咪添加成功',
            cat: {
                id: this.lastID,
                name,
                breed,
                age,
                weight,
                gender
            }
        });
    });
});

// 更新猫咪信息
router.put('/:id', authenticateToken, (req, res) => {
    const { name, breed, age, weight, gender } = req.body;
    const catId = req.params.id;
    
    const sql = `
        UPDATE cats 
        SET name = ?, breed = ?, age = ?, weight = ?, gender = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
    `;
    
    db.run(sql, [name, breed, age, weight, gender, catId, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({ error: '更新猫咪信息失败' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: '猫咪不存在' });
        }
        
        res.json({
            success: true,
            message: '猫咪信息更新成功'
        });
    });
});

// 删除猫咪
router.delete('/:id', authenticateToken, (req, res) => {
    const catId = req.params.id;
    
    const sql = 'DELETE FROM cats WHERE id = ? AND user_id = ?';
    
    db.run(sql, [catId, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({ error: '删除猫咪失败' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: '猫咪不存在' });
        }
        
        res.json({
            success: true,
            message: '猫咪删除成功'
        });
    });
});

module.exports = router;