// Placeholder. Full Ollama-backed implementation lands in Phase 2.
// Returns INFO_NEEDED deterministically so the rest of the pipeline is testable.
export async function decide(_order, _type, _customerMsg) {
  return {
    d: 'INFO_NEEDED',
    a: 'NONE',
    r: 'LLM not wired yet',
    msg: "Your request is under review. We'll respond within 24 hours.",
    photo: false,
  };
}
