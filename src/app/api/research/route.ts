import { NextRequest } from 'next/server';
import {
  planResearch,
  executeVectorInvestigation,
  synthesizeFinalDossier,
} from '@/lib/researchEngine';
import { ResearchDepth, SourceItem } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, depth = 'standard', apiKey = '', model = 'gemini-2.0-flash', provider = 'gemini' } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        try {
          const startTime = Date.now();
          sendEvent('system', {
            message: `Initializing NexusDeep Swarm for query: "${query}"`,
            timestamp: Date.now(),
          });

          // 1. Planning Phase
          sendEvent('stage', { stage: 'planning', message: 'Decomposing inquiry into orthogonal research vectors...' });
          const plan = await planResearch(query, depth as ResearchDepth, { apiKey, model, provider });
          sendEvent('plan_created', plan);

          // 2. Vector Investigation Phase
          const allSources: SourceItem[] = [];

          for (let i = 0; i < plan.vectors.length; i++) {
            const vector = plan.vectors[i];
            sendEvent('vector_start', {
              vectorId: vector.id,
              title: vector.title,
              index: i + 1,
              total: plan.vectors.length,
            });

            // Run scout investigation
            const { thoughts, findings, sources } = await executeVectorInvestigation(vector, {
              apiKey,
              model,
              provider,
            });

            vector.thoughts = thoughts;
            vector.findings = findings;
            vector.sources = sources;
            vector.status = 'completed';

            // Stream thoughts
            for (const thought of thoughts) {
              sendEvent('vector_thought', { vectorId: vector.id, thought });
              await new Promise((r) => setTimeout(r, 120));
            }

            // Stream sources
            for (const src of sources) {
              allSources.push(src);
              sendEvent('vector_source', { vectorId: vector.id, source: src });
            }

            sendEvent('vector_done', {
              vectorId: vector.id,
              findings,
              sourcesCount: sources.length,
            });
          }

          // 3. Cross-examination
          sendEvent('stage', {
            stage: 'cross_examination',
            message: 'Cross-referencing claims, computing certainty indexes, and detecting discrepancies...',
          });
          await new Promise((r) => setTimeout(r, 600));

          // 4. Final Synthesis
          sendEvent('stage', {
            stage: 'synthesis',
            message: 'Synthesizing publication-grade intelligence dossier with footnoted citations...',
          });

          const report = await synthesizeFinalDossier(plan, allSources, { apiKey, model, provider });

          sendEvent('synthesis_complete', {
            report,
            sourcesCount: allSources.length,
            vectorsCount: plan.vectors.length,
            durationMs: Date.now() - startTime,
          });

          sendEvent('complete', {
            status: 'success',
            durationMs: Date.now() - startTime,
          });

          controller.close();
        } catch (err: any) {
          console.error('Error during research execution:', err);
          sendEvent('error', { message: err?.message || 'An unexpected error occurred during research execution.' });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
