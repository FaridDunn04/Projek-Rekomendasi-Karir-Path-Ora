import { config } from "../../config/index.js";
import { createLogger } from "../../config/logger.js";
import { HttpAiGateway } from "./ai-gateway.http.js";
import { MockAiGateway } from "./ai-gateway.mock.js";
import type { AiGatewayAdapter } from "./ai-gateway.adapter.js";

const logger = createLogger("ai-gateway.factory");

export function createAiGateway(): AiGatewayAdapter {
  if (config.USE_MOCK_AI) {
    logger.warn({ useMockAi: true }, "ai.gateway.mock.enabled");
    return new MockAiGateway();
  }

  logger.info(
    {
      useMockAi: false,
      aiBaseUrl: config.AI_BASE_URL,
      timeoutMs: config.AI_TIMEOUT_MS,
    },
    "ai.gateway.http.enabled",
  );

  return new HttpAiGateway();
}
