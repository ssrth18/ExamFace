const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const root = path.resolve(__dirname, '..');
const port = process.env.PORT || 8080;
const PDF_ENGINE_URL = process.env.PDF_ENGINE_URL || '';

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

const exams = new Map();

function json(res, code, obj) {
  res.writeHead(code, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*'
  });
  res.end(JSON.stringify(obj));
}

function body(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', d => s += d);
    req.on('end', () => {
      try {
        resolve(s ? JSON.parse(s) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const upload = multer({
  dest: path.join(root, 'tmp', 'examface-uploads'),
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/health') {
      return json(res, 200, {
        ok: true,
        service: 'examface-api',
        pdfEngineConfigured: !!PDF_ENGINE_URL,
        time: new Date().toISOString()
      });
    }

    if (req.method === 'POST' && req.url === '/api/exams') {
      const b = await body(req);
      const id = crypto.randomBytes(6).toString('hex');

      exams.set(id, {
        ...b,
        id,
        createdAt: new Date().toISOString()
      });

      return json(res, 201, {
        id,
        url: `/exam/${id}`
      });
    }

    if (req.method === 'GET' && req.url.startsWith('/api/exams/')) {
      const id = req.url.split('/').pop();

      return exams.has(id)
        ? json(res, 200, exams.get(id))
        : json(res, 404, { error: 'not_found' });
    }

    if (req.method === 'POST' && req.url === '/api/extract') {
      if (!PDF_ENGINE_URL) {
        return json(res, 503, {
          error: 'pdf_engine_not_configured',
          message: 'PDF engine is not configured yet.'
        });
      }

      return upload.single('file')(req, res, async err => {
        try {
          if (err) {
            return json(res, 400, {
              error: 'upload_error',
              message: err.message
            });
          }

          if (!req.file) {
            return json(res, 400, {
              error: 'missing_file'
            });
          }

          const fileBuffer = fs.readFileSync(req.file.path);

          const form = new FormData();

          form.append(
            'file',
            new Blob([fileBuffer], {
              type: 'application/pdf'
            }),
            req.file.originalname || 'upload.pdf'
          );

          const response = await fetch(
            `${PDF_ENGINE_URL.replace(/\/$/, '')}/v1/extract`,
            {
              method: 'POST',
              body: form
            }
          );

          const text = await response.text();

          fs.unlink(req.file.path, () => {});

          res.writeHead(response.status, {
            'content-type':
              response.headers.get('content-type') ||
              'application/json',
            'access-control-allow-origin': '*'
          });

          return res.end(text);
        } catch (e) {
          if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
          }

          return json(res, 500, {
            error: 'pdf_engine_error',
            message: e.message
          });
        }
      });
    }

    let u = req.url.split('?')[0];

    if (u === '/') {
      u = '/index.html';
    }

    const file = path.join(root, u);

    if (
      !file.startsWith(root) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    ) {
      return json(res, 404, {
        error: 'not_found'
      });
    }

    res.writeHead(200, {
      'content-type':
        mime[path.extname(file)] ||
        'application/octet-stream'
    });

    fs.createReadStream(file).pipe(res);

  } catch (e) {
    json(res, 500, {
      error: 'server_error',
      message: e.message
    });
  }
});

server.listen(
  port,
  '0.0.0.0',
  () => console.log(`ExamFace running at http://localhost:${port}`)
);
