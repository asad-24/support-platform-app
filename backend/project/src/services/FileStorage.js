'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('@core/util/functions/config');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_UPLOAD_ROOT = path.join(PROJECT_ROOT, 'uploads');
const PUBLIC_UPLOAD_PATH = '/uploads';

function trimSlashes(value) {
  return String(value || '').replace(/^\/+|\/+$/g, '');
}

function sanitizeName(value) {
  const ext = path.extname(value || '').toLowerCase();
  const base = path.basename(value || 'upload', ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'upload';
  return `${base}${ext}`;
}

function extensionFor(file) {
  const ext = path.extname(file.originalname || '');
  if (ext) return ext.toLowerCase();
  const mimeExt = String(file.mimetype || '').split('/')[1];
  return mimeExt ? `.${mimeExt.replace(/[^a-z0-9]/gi, '').toLowerCase()}` : '';
}

function publicBaseUrl(req) {
  const configured = process.env.SERVER_PUBLIC_URL || config('server.publicUrl', null) || process.env.BASE_URL;
  if (configured) return String(configured).replace(/\/+$/, '');

  if (req && typeof req.get === 'function' && req.get('host')) {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    return `${protocol}://${req.get('host')}`;
  }

  const host = config('server.host', '127.0.0.1');
  const port = config('server.port', 8000);
  return `http://${host}:${port}`;
}

class LocalStorageProvider {
  constructor(options = {}) {
    this.root = path.resolve(options.root || process.env.STORAGE_LOCAL_ROOT || DEFAULT_UPLOAD_ROOT);
  }

  async save(file, options = {}) {
    if (!file || !file.buffer) {
      throw new Error('Uploaded file is missing from the request.');
    }

    const folder = trimSlashes(options.folder || 'misc');
    const safeOriginal = sanitizeName(file.originalname || `${file.fieldname || 'upload'}${extensionFor(file)}`);
    const ext = path.extname(safeOriginal) || extensionFor(file);
    const base = path.basename(safeOriginal, path.extname(safeOriginal));
    const filename = `${base}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const directory = path.join(this.root, folder);
    const absolutePath = path.join(directory, filename);

    await fs.promises.mkdir(directory, { recursive: true });
    await fs.promises.writeFile(absolutePath, file.buffer);

    const relativePath = path.posix.join('uploads', ...folder.split('/'), filename);
    const publicPath = path.posix.join(PUBLIC_UPLOAD_PATH, folder, filename);

    return {
      publicUrl: `${publicBaseUrl(options.req)}${publicPath}`,
      localPath: relativePath,
      filename,
      mimeType: file.mimetype,
      size: file.size,
      absolutePath,
    };
  }
}

class S3StorageProvider {
  async save() {
    throw new Error('S3 storage is not configured yet. Set STORAGE_DRIVER=local until S3 credentials are added.');
  }
}

function provider() {
  const driver = String(process.env.STORAGE_DRIVER || 'local').toLowerCase();
  if (driver === 's3') return new S3StorageProvider();
  return new LocalStorageProvider();
}

async function saveUploadedFile(file, options = {}) {
  return provider().save(file, options);
}

function uploadRoot() {
  return path.resolve(process.env.STORAGE_LOCAL_ROOT || DEFAULT_UPLOAD_ROOT);
}

module.exports = {
  DEFAULT_UPLOAD_ROOT,
  PUBLIC_UPLOAD_PATH,
  LocalStorageProvider,
  S3StorageProvider,
  saveUploadedFile,
  uploadRoot,
};
