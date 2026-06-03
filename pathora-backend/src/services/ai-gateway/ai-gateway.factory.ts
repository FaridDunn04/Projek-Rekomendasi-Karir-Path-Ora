import { config } from "../../config/index.js";
import { HttpAiGateway } from "./ai-gateway.http.js";
import { MockAiGateway } from "./ai-gateway.mock.js";
import type { AiGatewayAdapter } from "./ai-gateway.adapter.js";

export function createAiGateway(): AiGatewayAdapter {
  return  new HttpAiGateway();
}
