import { useQuery } from '@apollo/client'
import { client } from 'agnostic/client'
import gql from 'graphql-tag'

const query = gql`
  query SyncStatus {
    sync_status {
      last_sync_number
    }
  }
`

interface SyncStatusResponse {
  sync_status: [{ last_sync_number: string }]
}

export function useFetchedSubgraphStatus(): {
  available: boolean | null
  syncedBlock: number | undefined
  headBlock: number | undefined
} {
  const { data, loading, error } = useQuery<SyncStatusResponse>(query, {
    client,
    fetchPolicy: 'network-only',
    context: { headers: { 'Cache-control': 'no-cache' } },
  })

  const parsed = parseInt(data?.sync_status?.at(0)?.last_sync_number ?? '', 10)

  if (loading) {
    return { available: null, syncedBlock: undefined, headBlock: undefined }
  }

  if (error || (isNaN(parsed) && !loading)) {
    return { available: false, syncedBlock: undefined, headBlock: undefined }
  }

  return { available: true, headBlock: parsed, syncedBlock: parsed }
}
