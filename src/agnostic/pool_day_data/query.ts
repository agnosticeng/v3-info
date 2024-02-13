import type { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { client } from 'agnostic/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import gql from 'graphql-tag'
import { PoolChartEntry } from 'state/pools/reducer'

dayjs.extend(utc)

const POOL_CHART = gql`
  query poolDayDatas($startTime: String!, $address: String!) {
    pool_day_data(address: $address, start_at: $startTime) {
      date
      tx_count
      pool_address
      pool_fee_tier
      tvl_usd
      volume_usd
      fees_usd
    }
  }
`

interface QueryResults {
  pool_day_data: {
    date: string
    tx_count: string
    volume_usd: string
    tvl_usd: string
    fees_usd: string
    pool_fee_tier: string
    pool_address: string
  }[]
}

const startTimestamp = 1619170975

export async function fetchPoolChartData(
  address: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _client: ApolloClient<NormalizedCacheObject>,
): Promise<{ data: PoolChartEntry[]; error: boolean }> {
  const { data, error } = await client.query<QueryResults>({
    query: POOL_CHART,
    variables: {
      address: address,
      startTime: dayjs.unix(startTimestamp).format('YYYY-MM-DD'),
    },
    fetchPolicy: 'cache-first',
  })

  return {
    data:
      data.pool_day_data?.map((d) => {
        const feePercent = parseFloat(d.pool_fee_tier) / 10000
        const tvlAdjust = parseFloat(d.volume_usd) * feePercent

        return {
          date: dayjs(d.date).unix(),
          volumeUSD: parseFloat(d.volume_usd),
          totalValueLockedUSD: parseFloat(d.tvl_usd) - tvlAdjust,
          feesUSD: parseFloat(d.fees_usd),
        }
      }) ?? [],
    error: Boolean(error),
  }
}
