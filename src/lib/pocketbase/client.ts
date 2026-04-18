import PocketBase from 'pocketbase'

const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || 'https://app-pericias-08888.goskip.app',
)
pb.autoCancellation(false)

export default pb
