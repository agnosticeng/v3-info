import type { ApolloClient } from '@apollo/client'
import { client } from 'agnostic/client'
import type { NormalizedCacheObject } from 'apollo-cache-inmemory'
import dayjs from 'dayjs'
import { gql } from 'graphql-tag'
import { useEffect, useState } from 'react'

const GET_BLOCK_NUMBER = gql`
  query GetBlockNumber($start_at: String!, $end_at: String!) {
    blocks(start_at: $start_at, end_at: $end_at) {
      block_number
    }
  }
`

interface BlockResponseData {
  blocks: { block_number: string }[]
}

export function useBlocksFromTimestamps(
  timestamps: number[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _blockClientOverride?: ApolloClient<NormalizedCacheObject>,
): {
  blocks:
    | {
        timestamp: string
        number: any
      }[]
    | undefined
  error: boolean
} {
  const [error, setError] = useState(false)
  const [blocks, setBlocks] = useState<
    | {
        timestamp: string
        number: any
      }[]
    | undefined
  >()

  useEffect(() => {
    async function fetchData() {
      const results = await Promise.all(
        timestamps.map((t) => {
          return client.query<BlockResponseData>({
            query: GET_BLOCK_NUMBER,
            variables: { start_at: dayjs.unix(t).toISOString(), end_at: dayjs.unix(t + 600).toISOString() },
            fetchPolicy: 'cache-first',
          })
        }),
      )

      if (results.some((e) => e.error)) {
        setError(true)
      } else {
        setBlocks(
          timestamps.map((t, i) => ({
            timestamp: t.toString(),
            number: results[i].data.blocks[0].block_number,
          })),
        )
      }
    }

    if (!blocks && !error) fetchData()
  }, [timestamps, blocks, error])

  return { blocks, error }
}
