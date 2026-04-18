import PocketBase from 'pocketbase'

// Ensure we use the public URL for real-time and client interactions
let url = import.meta.env.VITE_POCKETBASE_URL || ''
if (url.includes('.internal.goskip.dev')) {
  url = 'https://app-pericias-08888.goskip.app'
}

const pb = new PocketBase(url)
pb.autoCancellation(false)

export default pb
