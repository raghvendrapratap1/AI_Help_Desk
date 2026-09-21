import { Router, Response } from 'express';
import { KnowledgeChunk } from '../models/KnowledgeChunk.js';
import { generateEmbedding, cosineSimilarity } from '../ai/embeddingService.js';
import { authGuard, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * GET /api/rag/chunks
 * List all knowledge chunks for the authenticated clinic
 */
router.get('/chunks', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    if (!clinicId) return res.status(403).json({ success: false, error: 'Clinic context missing' });

    const chunks = await KnowledgeChunk.find({ clinicId }).sort({ createdAt: -1 });
    return res.json({ success: true, chunks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/rag/chunks
 * Create and index a new knowledge chunk with its embedding vector
 */
router.post('/chunks', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    if (!clinicId) return res.status(403).json({ success: false, error: 'Clinic context missing' });

    const { title, category, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const textToEmbed = `${title}. ${content}`;
    const embedding = await generateEmbedding(textToEmbed);

    const chunk = await KnowledgeChunk.create({
      clinicId,
      title,
      category: category || 'general',
      content,
      embedding
    });

    return res.status(201).json({
      success: true,
      message: 'Knowledge chunk created and indexed successfully',
      chunk: {
        id: chunk._id,
        title: chunk.title,
        category: chunk.category,
        dimensions: embedding.length
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/rag/query
 * Semantic vector similarity search over clinic knowledge chunks
 */
router.post('/query', authGuard, async (req: AuthRequest, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    if (!clinicId) return res.status(403).json({ success: false, error: 'Clinic context missing' });

    const { query, topK = 3 } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Query text is required' });

    const queryVec = await generateEmbedding(query);
    const chunks = await KnowledgeChunk.find({ clinicId });

    const scored = chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryVec, chunk.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, topK).map(s => ({
      id: s.chunk._id,
      title: s.chunk.title,
      category: s.chunk.category,
      content: s.chunk.content,
      similarityScore: Math.round(s.score * 100) / 100
    }));

    return res.json({
      success: true,
      query,
      results: topResults
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
