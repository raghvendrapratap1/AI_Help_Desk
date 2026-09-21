/**
 * Embedding Service using @xenova/transformers
 * Generates local in-process dense vector embeddings using Xenova/all-MiniLM-L6-v2.
 * Free, lightweight, zero external API costs, running purely on CPU.
 */

let pipelineInstance: any = null;

export async function getEmbeddingPipeline() {
  if (!pipelineInstance) {
    try {
      const { pipeline } = await import('@xenova/transformers');
      pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('[EMBEDDINGS] Loaded Xenova/all-MiniLM-L6-v2 pipeline successfully');
    } catch (err) {
      console.warn('[EMBEDDINGS] Transformers pipeline lazy load fallback:', err);
    }
  }
  return pipelineInstance;
}

/**
 * Generates a normalized 384-dimensional dense vector for a text string.
 * Falls back gracefully to deterministic pseudo-vector if transformers environment has loading constraints.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const pipe = await getEmbeddingPipeline();
    if (pipe) {
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    }
  } catch (err) {
    console.warn('[EMBEDDINGS] Primary pipeline extraction failed, using fallback vector:', err);
  }

  // Deterministic 384-dim fallback vector for testing & zero-dependency environments
  const fallback = new Array(384).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 384;
    fallback[idx] += 1 / (i + 1);
  }
  // Normalize
  const mag = Math.sqrt(fallback.reduce((s, v) => s + v * v, 0)) || 1;
  return fallback.map(v => v / mag);
}

/**
 * Computes cosine similarity between two normalized vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
