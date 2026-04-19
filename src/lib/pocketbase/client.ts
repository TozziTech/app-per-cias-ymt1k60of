import PocketBase from 'pocketbase'

let pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://app-pericias-08888.goskip.app'
if (pbUrl.includes('.internal.goskip.')) {
  pbUrl = 'https://app-pericias-08888.goskip.app'
}

const pb = new PocketBase(pbUrl)
pb.autoCancellation(false)

export default pb
