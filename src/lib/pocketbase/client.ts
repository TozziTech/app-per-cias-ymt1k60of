import PocketBase from 'pocketbase'

const envUrl = import.meta.env.VITE_POCKETBASE_URL
const publicUrl = 'https://app-pericias-08888.goskip.app'
const url = envUrl && !envUrl.includes('.internal.') ? envUrl : publicUrl

const pb = new PocketBase(url)
pb.autoCancellation(false)

export default pb
