import { useQuery } from '@apollo/client'
import { client } from 'agnostic/client'
import dayjs from 'dayjs'
import gql from 'graphql-tag'
import type { EthPrices } from 'hooks/useEthPrices'
import { useMemo } from 'react'

const QUERY = gql`
  query prices($current: String!, $date24: String!, $date48: String!, $dateWeek: String!) {
    current: eth_price(ts: $current) {
      price_usd
    }

    oneDay: eth_price(ts: $date24) {
      price_usd
    }

    twoDay: eth_price(ts: $date48) {
      price_usd
    }

    oneWeek: eth_price(ts: $dateWeek) {
      price_usd
    }
  }
`

interface PricesResponse {
  current: [{ price_usd: string }]
  oneDay: [{ price_usd: string }]
  twoDay: [{ price_usd: string }]
  oneWeek: [{ price_usd: string }]
}

function useDeltaTimestamps(): [string, string, string, string] {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').toISOString()
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').toISOString()
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').toISOString()
  return [utcCurrentTime.startOf('minute').toISOString(), t1, t2, tWeek]
}

export function useEthPrices(): EthPrices | undefined {
  const [current, date24, date48, dateWeek] = useDeltaTimestamps()

  const { data } = useQuery<PricesResponse>(QUERY, {
    client,
    variables: { current, date24, date48, dateWeek },
    fetchPolicy: 'cache-first',
  })

  return useMemo(() => {
    return {
      current: parseFloat(data?.current?.at(0)?.price_usd ?? '0'),
      oneDay: parseFloat(data?.oneDay?.at(0)?.price_usd ?? '0'),
      twoDay: parseFloat(data?.twoDay?.at(0)?.price_usd ?? '0'),
      week: parseFloat(data?.oneWeek?.at(0)?.price_usd ?? '0'),
    }
  }, [data])
}
