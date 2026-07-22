import { Router } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50', 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/avif').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// POST /upload/image
router.post('/image', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(422).json({ error: 'No file provided' });
  if (!supabase) return res.status(503).json({ error: 'Storage not configured' });

  try {
    const bucket = req.query.bucket as string || process.env.SUPABASE_STORAGE_BUCKET_IMAGES || 'product-images';
    const ext = req.file.originalname.split('.').pop();
    const filename = `${req.user!.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
    return res.json({ url: urlData.publicUrl, filename });
  } catch (err) {
    logger.error('Upload error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /upload/document
router.post('/document', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(422).json({ error: 'No file provided' });
  if (!supabase) return res.status(503).json({ error: 'Storage not configured' });

  const allowedDocTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedDocTypes.includes(req.file.mimetype)) {
    return res.status(422).json({ error: 'Only PDF and images allowed for documents' });
  }

  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET_DOCS || 'documents';
    const ext = req.file.originalname.split('.').pop();
    const filename = `${req.user!.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
    return res.json({ url: urlData.publicUrl, filename });
  } catch (err) {
    logger.error('Document upload error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
