import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio si no existe
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Lista de imágenes a descargar
const images = [
  {
    url: 'https://images.unsplash.com/photo-1612198186241-03605c0a4c1b?q=80&w=1200&auto=format&fit=crop',
    filename: 'gpu-rtx4070.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1587202372775-98927b7552f1?q=80&w=1200&auto=format&fit=crop',
    filename: 'cpu-ryzen.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
    filename: 'motherboard.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1612198185955-d83894e4fb00?q=80&w=1200&auto=format&fit=crop',
    filename: 'ram-tridentz.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    filename: 'ssd-samsung.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1623126908020-7f0eb8f359bd?q=80&w=1200&auto=format&fit=crop',
    filename: 'psu-corsair.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1587202372616-b43abea06f3a?q=80&w=1200&auto=format&fit=crop',
    filename: 'case-lianli.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1587202372583-4932f2b5a8f2?q=80&w=1200&auto=format&fit=crop',
    filename: 'cooler-nzxt.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1587202372719-0bc1ac2e3d82?q=80&w=1200&auto=format&fit=crop',
    filename: 'mouse-logitech.jpg'
  },
  // Imágenes de la galería de instalaciones
  {
    url: 'https://images.unsplash.com/photo-1532634896-26909d0d4b6a?q=80&w=1600&auto=format&fit=crop',
    filename: 'warehouse-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1586521995568-39ec2e6f75b4?q=80&w=1600&auto=format&fit=crop',
    filename: 'warehouse-2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1600&auto=format&fit=crop',
    filename: 'warehouse-3.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1600&auto=format&fit=crop',
    filename: 'office-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1520785643438-5bf77931f493?q=80&w=1600&auto=format&fit=crop',
    filename: 'office-2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
    filename: 'office-3.jpg'
  }
];

// Función para descargar una imagen
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Seguir redirecciones
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Eliminar archivo parcial
      reject(err);
    });
  });
}

// Descargar todas las imágenes
console.log('🚀 Iniciando descarga de imágenes...\n');

(async () => {
  let successCount = 0;
  let errorCount = 0;

  for (const image of images) {
    const filepath = path.join(imagesDir, image.filename);
    
    try {
      console.log(`📥 Descargando: ${image.filename}...`);
      await downloadImage(image.url, filepath);
      console.log(`✅ Descargado: ${image.filename}\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error descargando ${image.filename}: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Descargas exitosas: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📁 Ubicación: ${imagesDir}`);
  console.log('='.repeat(50));
})();
