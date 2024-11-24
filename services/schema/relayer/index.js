import { statusSchema as l2Relayer } from './l2'
import { statusSchema as bscRelayer } from './bsc'
import { statusSchema as xdaiRelayer } from './xdai'
import { statusSchema as defaultRelayer } from './default'
import { statusSchema as polygonRelayer } from './polygon'
import { statusSchema as avalancheRelayer } from './avalanche'

const sepoliaRelayer = JSON.parse(JSON.stringify(defaultRelayer))
sepoliaRelayer.properties.ethPrices.required = ['dai']

export default {
  l2Relayer,
  bscRelayer,
  xdaiRelayer,
  defaultRelayer,
  polygonRelayer,
  avalancheRelayer,
  sepoliaRelayer
}
