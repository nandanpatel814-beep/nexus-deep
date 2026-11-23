export type ResearchDepth = 'quick' | 'standard' | 'exhaustive';

export interface SourceItem {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

export interface ResearchVector {
  id: string;
  title: string;
  query: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  thoughts: string[];
  findings: string[];
  sources: SourceItem[];
}

export interface ResearchPlan {
  topic: string;
  objective: string;
  methodology: string;
  vectors: ResearchVector[];
}

export interface ResearchEvent {
  type:
    | 'system'
    | 'plan_created'
    | 'vector_start'
    | 'vector_thought'
    | 'vector_source'
    | 'vector_done'
    | 'cross_examination'
    | 'synthesis_stream'
    | 'synthesis_complete'
    | 'error';
  timestamp: number;
  data: any;
}
