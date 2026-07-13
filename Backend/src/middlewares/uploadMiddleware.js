const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do armazenamento para o multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
      
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {  
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    //Removida a duplicação do extname, limpando o nome do ficheiro salvo
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Filtro para garantir que só arquivos pdf e imagens sejam aceites
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Apenas são permitidos ficheiros em formato PDF ou Imagem (JPEG/JPG/PNG).'));
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 7 * 1024 * 1024 } // Limite de 7MB
});

module.exports = upload;