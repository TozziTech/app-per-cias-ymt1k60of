import PocketBase from 'pocketbase'

const envUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://app-pericias-08888.goskip.app'
const url = envUrl.includes('.internal.goskip.dev')
  ? 'https://app-pericias-08888.goskip.app'
  : envUrl

const pb = new PocketBase(url)
pb.autoCancellation(false)

export default pb
