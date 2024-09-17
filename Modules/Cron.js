const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

exports.SetUpSheldue = function() {
    cron.schedule('* * * * *', () => {
        const assetsDir = path.join( __dirname, '../Client/public/assets');

        fs.readdir(assetsDir, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(assetsDir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error('Error getting file stats:', err);
                        return;
                    }

                    const now = Date.now();
                    const fileTime = new Date(stats.mtime).getTime();
                    const age = (now - fileTime) / (1000 * 60 * 60 * 24); // в днях
                    console.log(age)
                    if (age > 0.6) { // старше одного дня
                        fs.unlink(filePath, err => {
                            if (err) {
                                console.error('Error deleting file:', err);
                            } else {
                                console.log(`Deleted: ${filePath}`);
                            }
                        });
                    }
                });
            });
        });
    });
}