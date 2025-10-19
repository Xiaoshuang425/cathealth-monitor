const db = require('../config/database');

class HealthRecord {
    static findByUserId(userId, callback) {
        const sql = `
            SELECT hr.*, c.name as cat_name 
            FROM health_records hr 
            LEFT JOIN cats c ON hr.cat_id = c.id 
            WHERE c.user_id = ? 
            ORDER BY hr.recorded_at DESC
        `;
        
        db.all(sql, [userId], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows);
        });
    }
    
    static create(recordData, callback) {
        const { cat_id, record_type, image_url, color, texture, shape, health_risk, notes } = recordData;
        
        const sql = `
            INSERT INTO health_records (cat_id, record_type, image_url, color, texture, shape, health_risk, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [cat_id, record_type, image_url, color, texture, shape, health_risk, notes], function(err) {
            if (err) return callback(err);
            
            callback(null, {
                id: this.lastID,
                cat_id,
                record_type,
                image_url,
                color,
                texture,
                shape,
                health_risk,
                notes
            });
        });
    }
}

module.exports = HealthRecord;