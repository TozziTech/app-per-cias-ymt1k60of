import PocketBase from 'pocketbase'

// Use environment variable, but fallback to the public URL if it's the internal one or missing
let url = import.meta.env.VITE_POCKETBASE_URL
if (!url || url.includes('.internal.')) {
  url = 'https://app-pericias-08888.goskip.app'
}

const pb = new PocketBase(url)
pb.autoCancellation(false)

export default pb
