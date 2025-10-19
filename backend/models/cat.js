const db = require('../config/database');

class Cat {
    static findByUserId(userId, callback) {
        const sql = 'SELECT * FROM cats WHERE user_id = ? ORDER BY created_at DESC';
        
        db.all(sql, [userId], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows);
        });
    }
    
    static findById(id, userId, callback) {
        const sql = 'SELECT * FROM cats WHERE id = ? AND user_id = ?';
        
        db.get(sql, [id, userId], (err, row) => {
            if (err) return callback(err);
            callback(null, row);
        });
    }
    
    static create(catData, callback) {
        const { user_id, name, breed, age, weight, gender } = catData;
        
        const sql = `
            INSERT INTO cats (user_id, name, breed, age, weight, gender) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [user_id, name, breed, age, weight, gender], function(err) {
            if (err) return callback(err);
            
            callback(null, {
                id: this.lastID,
                user_id,
                name,
                breed,
                age,
                weight,
                gender
            });
        });
    }
}

module.exports = Cat;