import PocketBase from 'pocketbase'

const pb = new PocketBase('https://app-pericias-08888.goskip.app')
pb.autoCancellation(false)

export default pb
