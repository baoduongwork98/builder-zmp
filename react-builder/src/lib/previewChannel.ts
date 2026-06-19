import { PageSchema, AppConfig, Variable, ApiDefinition } from "@/types/builder"

export type PreviewSnapshot = {
  pages: PageSchema[]
  appConfig: AppConfig
  variables: Variable[]
  apis: ApiDefinition[]
}

const CHANNEL_NAME = "zmp-preview"

export function broadcastState(snapshot: PreviewSnapshot): void {
  const ch = new BroadcastChannel(CHANNEL_NAME)
  ch.postMessage(snapshot)
  ch.close()
}

export function listenPreviewState(cb: (s: PreviewSnapshot) => void): () => void {
  const ch = new BroadcastChannel(CHANNEL_NAME)
  ch.onmessage = (e) => cb(e.data as PreviewSnapshot)
  return () => ch.close()
}
