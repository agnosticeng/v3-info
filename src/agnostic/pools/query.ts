import gql from 'graphql-tag'

export const TOP_POOLS = gql`
  query UniswapV3TopPools {
    uniswapv3_pools {
      address
    }
  }
`
