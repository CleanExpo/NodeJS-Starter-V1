/**
 * Example Agent Implementations
 *
 * Pre-built agents demonstrating patterns from the OpenAI Agents SDK.
 */

// Contractor Availability Agent (Australian locale)
export {
  contractorAgent,
  createContractorContext,
  checkAvailabilityTool,
  bookAppointmentTool,
  calculateQuoteTool,
  australianDateGuardrail,
  gstOutputGuardrail,
} from "./contractor-agent";

export type { ContractorContext } from "./contractor-agent";

// Multi-Agent Orchestration Examples
export {
  // Specialized agents
  technicalSupportAgent,
  billingSupportAgent,
  salesAgent,
  // Orchestration patterns
  managerAgent,
  triageAgent,
  supportRouter,
  // Helper functions
  createSupportContext,
  runDiagnosticChain,
  getMultiplePerspectives,
} from "./multi-agent";

export type { SupportContext } from "./multi-agent";
