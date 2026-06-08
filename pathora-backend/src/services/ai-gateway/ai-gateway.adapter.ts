import type { AiAnalysisResult } from "./ai-response.schema.js";

export type CvSource =
  | { kind: "text"; rawText: string }
  | {
      kind: "file";
      fileData: Buffer;
      fileMime: string;
      fileName?: string;
    };

export type AnalyzeContext = {
  sessionId?: string;
  userId?: string;
};

export interface AiGatewayAdapter {
  analyze(
    source: CvSource,
    cvId: string,
    context?: AnalyzeContext,
  ): Promise<AiAnalysisResult>;
}
