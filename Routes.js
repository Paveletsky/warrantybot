const path  = require('path');
const fs    = require('fs');
const mysql = require('./Modules/MySQL.js');

const { 
    createCanvas, 
    loadImage 
} = require('canvas');

const {
    botInstance
}  = require('./Modules/Bot.js');

exports.RoutesConfig = function (application) {
    application.post('/api/generate', async (req, res) => {
        try {
            const { text, positions, 
                    geo, manager_id, client_name } = req.body;

            if (!text || !positions || positions.length === 0) {
                return res.status(400).send('Invalid request data');
            }

            const imagePath = path.join(__dirname, `/Client/public/assets/dummy/${geo}.PNG`);
            const baseImage = await loadImage(imagePath);

            const width = baseImage.width;
            const height = baseImage.height;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(baseImage, 0, 0, width, height);

            ctx.fillStyle = '#000000';
            ctx.font = 'bold 34px "Times New Roman"';            

            positions.forEach((pos, index) => {
                if (index > 3) {
                    ctx.font = 'italic 34px "Times New Roman"'; 
                }

                ctx.fillText(text[index] || '', pos.x, pos.y);
            });

            const id = Date.now();
            const outputPath = path.join(__dirname, '/Client/public/assets', `${id}.png`);
            const out = fs.createWriteStream(outputPath);
            const stream = canvas.createPNGStream();
            
            mysql.insert(req, res, id, manager_id, client_name);

            stream.pipe(out);
            out.on('finish', () => {
                res.json({ url: id });
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred');
        }
    });

    application.post('/api/confirm', async (req, res) => {
        try {
            const { id } = req.body;

            if (!id) {
                return res.status(400).send('Invalid request data');
            }

            const updateQuery = 'UPDATE warranty_data SET confirmed = ? WHERE id = ?';
            mysql.connection.query(updateQuery, ['true', id], (error, result) => {
                if (error) {
                    console.error('Error during UPDATE query:', error);
                    return res.status(500).send('Internal Server Error');
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred');
        }
    });

    application.post('/api/save-image', (req, res) => {
        const { imageData, filename } = req.body;

        const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
        const filePath = path.join(__dirname, '/Client/public/assets', filename);

        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err) {
                console.error('Error saving image:', err);
                return res.status(500).json({ message: 'Failed to save image' });
            }

            let imageId = filename.replace(/\.PNG$/i, "");
            const selectQuery = 'SELECT manager_id, client_name FROM warranty_data WHERE id = ?';
            mysql.connection.query(selectQuery, [imageId], (err, result) => {
                if (err) {
                    console.error('Error during SELECT query:', error);
                    return res.status(500).send('Internal Server Error');
                }

                let data = result[0]                    
                botInstance.sendPhoto(data.manager_id, 
                    {source: filePath}, 
                    {caption: data.client_name}
                )
            })
            
            res.json({ message: 'Image saved successfully', filePath });
        });
    });

    application.get('/warranty/:filename', (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '/Client/public/assets', filename + '.png');

        if (fs.existsSync(filePath)) {
            const checkQuery = 'SELECT confirmed FROM warranty_data WHERE id = ?';
            mysql.connection.query(checkQuery, [filename], (error, results) => {
                res.render('index', { filename: filename, filePath: `assets/${filename}.png`, confirmed: results[0].confirmed });
            });
        } else {
            res.status(404).send('Image not found');
        }
    });

    application.get('/', async (req, res) => {
        res.send('Welcome');
    });
};