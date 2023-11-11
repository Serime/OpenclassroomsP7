const sharp = require('sharp');
const path = require('path')
const fs = require('fs')

fs.readdir('images', (err, dir) => {
    if (dir === undefined)
    {
        fs.mkdir('images', (err) => {
            console.log('Dossier images crée')
        })
    }
})

module.exports = (request, response, next) => {
  if (!request.file) {
      next()
      return 
  }
  const { buffer, originalname } = request.file;
  const fileDatas = path.parse(originalname);
  const link = fileDatas.name.split(' ').join('_') + '_' + Date.now() + '.webp';

  sharp(buffer)
    .resize(206, 260, { fit: sharp.fit.contain, background: { r: 0, g: 0, b: 0, alpha: 0}})
    .webp({ quality: 20 })
    .toFile(`./images/${link}`, (error) => {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'Impossible de sauvegarder.' });
        }  
        request.file.filename = link;
        
        next();
    });  
};