import PocketBase from 'pocketbase'

const getPbUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }
  return import.meta.env.VITE_POCKETBASE_URL || '/'
}

const pb = new PocketBase(getPbUrl())
pb.autoCancellation(false)

export default pb
