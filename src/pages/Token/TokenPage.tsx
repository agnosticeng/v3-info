import React, { useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useTokenData, usePoolsForToken, useTokenChartData, useTokenPriceData } from 'state/tokens/hooks'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { Token } from '@uniswap/sdk'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { shortenAddress } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow, RowFlat } from 'components/Row'
import { TYPE } from 'theme'
import Loader from 'components/Loader'
import { LogIn, Star, ExternalLink, Download } from 'react-feather'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, ButtonGray } from 'components/Button'
import { DarkGreyCard } from 'components/Card'
import { usePoolDatas } from 'state/pools/hooks'
import PoolTable from 'components/pools/PoolTable'
import LineChart from 'components/LineChart'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart'
import CandleChart from 'components/CandleChart'

const PriceText = styled(TYPE.label)`
  font-size: 36px;
  line-height: 1;
`

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 1em;
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
}

export default function TokenPage({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  // theming
  const backgroundColor = useColor(address)
  const theme = useTheme()

  // token data
  const tokenData = useTokenData(address)
  const mockCurrency = new Token(1, address, 0)

  // get the data for the pools this token is a part of
  const poolsForToken = usePoolsForToken(address)
  const poolDatas = usePoolDatas(poolsForToken ?? [])

  const chartData = useTokenChartData(address)

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const [view, setView] = useState(ChartView.TVL)
  const [latestValue, setLatestValue] = useState<number | undefined>(10)

  const priceData = useTokenPriceData(address, 3600)
  const formattedPriceData = useMemo(() => {
    if (priceData) {
      return priceData.map((day) => {
        return {
          time: parseFloat(day.timestamp),
          open: day.open,
          close: day.close,
          high: day.close,
          low: day.open,
        }
      })
    } else {
      return []
    }
  }, [priceData])

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {tokenData ? (
        <AutoColumn gap="32px">
          <RowBetween>
            <AutoRow gap="4px">
              <TYPE.main>{`Home > `}</TYPE.main>
              <TYPE.label>{` Tokens `}</TYPE.label>
              <TYPE.main>{` > `}</TYPE.main>
              <TYPE.label>{` ${tokenData.symbol} `}</TYPE.label>
              <TYPE.main>{` (${shortenAddress(address)}) `}</TYPE.main>
            </AutoRow>
            <AutoRow gap="10px" justify="flex-end">
              <LogIn stroke={theme.text2} />
              <Star stroke={theme.text2} />
              <ExternalLink stroke={theme.text2} />
            </AutoRow>
          </RowBetween>
          <RowBetween>
            <AutoColumn gap="md">
              <AutoRow gap="4px">
                <CurrencyLogo currency={mockCurrency} />
                <TYPE.label fontSize="20px">{tokenData.name}</TYPE.label>
                <TYPE.main fontSize="20px">{tokenData.symbol}</TYPE.main>
              </AutoRow>
              <RowFlat>
                <PriceText mr="10px"> {formatDollarAmount(tokenData.priceUSD)}</PriceText>
                (<Percent value={tokenData.priceUSDChange} />)
              </RowFlat>
            </AutoColumn>
            <RowFixed>
              <ButtonGray width="170px" mr="12px">
                <RowBetween>
                  <Download size={24} />
                  <div style={{ display: 'flex', alignItems: 'center' }}>Add Liquidity</div>
                </RowBetween>
              </ButtonGray>
              <ButtonPrimary width="100px">Trade</ButtonPrimary>
            </RowFixed>
          </RowBetween>
          <ContentLayout>
            <DarkGreyCard>
              <AutoColumn gap="lg">
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>TVL</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.tvlUSD)}</TYPE.label>
                  <Percent value={tokenData.tvlUSDChange} />
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>24h Trading Vol</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSD)}</TYPE.label>
                  <Percent value={tokenData.volumeUSDChange} />
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>7d Trading Vol</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSDWeek)}</TYPE.label>
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>24h Txns</TYPE.main>
                  <TYPE.label fontSize="24px">{tokenData.txCount ?? 0}</TYPE.label>
                </AutoColumn>
              </AutoColumn>
            </DarkGreyCard>
            <DarkGreyCard>
              <RowBetween>
                <TYPE.main>{latestValue}</TYPE.main>
                <ToggleWrapper width="160px">
                  <ToggleElementFree
                    isActive={view === ChartView.VOL}
                    fontSize="12px"
                    onClick={() => setView(ChartView.VOL)}
                  >
                    Volume
                  </ToggleElementFree>
                  <ToggleElementFree
                    isActive={view === ChartView.TVL}
                    fontSize="12px"
                    onClick={() => setView(ChartView.TVL)}
                  >
                    TVL
                  </ToggleElementFree>
                  {/* <ToggleElementFree
                    isActive={view === ChartView.PRICE}
                    fontSize="12px"
                    onClick={() => setView(ChartView.PRICE)}
                  >
                    Price
                  </ToggleElementFree> */}
                </ToggleWrapper>
              </RowBetween>
              {view === ChartView.TVL ? (
                <LineChart data={formattedTvlData} color={backgroundColor} minHeight={340} setValue={setLatestValue} />
              ) : view === ChartView.VOL ? (
                <BarChart data={formattedVolumeData} color={backgroundColor} minHeight={340} />
              ) : view === ChartView.PRICE ? (
                <CandleChart data={formattedPriceData} />
              ) : null}
            </DarkGreyCard>
          </ContentLayout>
          <TYPE.main fontSize="24px">Pools</TYPE.main>
          <DarkGreyCard>
            <PoolTable poolDatas={poolDatas} />
          </DarkGreyCard>
        </AutoColumn>
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}