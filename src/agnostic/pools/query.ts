import { useQuery } from '@apollo/client'
import { client } from 'agnostic/client'
import gql from 'graphql-tag'
import { useMemo } from 'react'

export const TOP_POOLS = gql`
  query UniswapV3TopPools {
    uniswapv3_pools {
      address
    }
  }
`

interface TopPoolsResponse {
  uniswapv3_pools: {
    address: string
  }[]
}

export function useTopPoolAddresses() {
  const { data, loading, error } = useQuery<TopPoolsResponse>(TOP_POOLS, { client, fetchPolicy: 'cache-first' })

  const formattedData = useMemo(() => data?.uniswapv3_pools.map((p) => p.address), [data])

  return {
    loading: loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}
