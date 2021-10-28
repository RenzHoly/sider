import { useCallback, useEffect } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { useSelector, useDispatch } from 'react-redux'
import { ListChildComponentProps } from 'react-window'
import { Unpacked } from 'utils'
import { sscan } from 'utils/scanner'
import useScanSize from 'hooks/use-scan-size'
import { formatNumber } from 'utils/formatter'
import { runCommand } from 'utils/fetcher'
import { actions } from 'stores'
import SetMatchInput from './set-match-input'
import InfiniteList from '../pure/infinite-list'
import InfiniteListItems from '../pure/infinite-list-items'
import SetItem from './set-item'
import Footer from '../pure/footer'
import TTLButton from '../ttl-button'
import ReloadButton from '../pure/reload-button'
import Editor from '../pure/editor'

export default function SetPanel(props: { value: string }) {
  const connection = useSelector((state) => state.root.connection)
  const match = useSelector((state) => state.set.match)
  const isPrefix = useSelector((state) => state.set.isPrefix)
  const handleGetKey = useCallback(
    (
      _index: number,
      previousPageData: Unpacked<ReturnType<typeof sscan>> | null,
    ): Parameters<typeof sscan> | null => {
      if (previousPageData?.next === '0') {
        return null
      }
      return connection
        ? [
            connection,
            props.value,
            match,
            isPrefix,
            previousPageData?.next || '0',
            previousPageData?.zeroTimes || 0,
            previousPageData?.totalScanned || 0,
            previousPageData?.getKey,
          ]
        : null
    },
    [connection, props.value, match, isPrefix],
  )
  const { data, setSize, isValidating, mutate } = useSWRInfinite(
    handleGetKey,
    sscan,
    {
      revalidateOnFocus: false,
    },
  )
  const handleLoadMoreItems = useCallback(async () => {
    await setSize((_size) => _size + 1)
  }, [setSize])
  const renderItems = useCallback(
    (p: ListChildComponentProps) => (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <InfiniteListItems {...p}>{SetItem}</InfiniteListItems>
    ),
    [],
  )
  const { data: scard, mutate: mutateScard } = useSWR(
    connection ? ['scard', connection, props.value] : null,
    () => runCommand<number>(connection!, ['scard', props.value]),
  )
  const scanSize = useScanSize(data)
  const handleReload = useCallback(async () => {
    await mutate()
    await setSize(1)
    await mutateScard()
  }, [setSize, mutate, mutateScard])
  const selectedKey = useSelector((state) => state.set.selectedKey)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.set.setSelectedKey(data?.[0]?.keys[0]))
  }, [props.value, dispatch, data])

  return (
    <>
      <div style={{ width: 360, display: 'flex', flexDirection: 'column' }}>
        <SetMatchInput />
        <div style={{ flex: 1 }}>
          <InfiniteList
            items={data}
            total={scard}
            onLoadMoreItems={handleLoadMoreItems}
          >
            {renderItems}
          </InfiniteList>
        </div>
        <Footer>
          <TTLButton style={{ flexBasis: 80 }} value={props.value} />
          <span>
            {formatNumber(scanSize)}&nbsp;of&nbsp;
            {formatNumber(scard || 0)}
          </span>
          <ReloadButton
            style={{
              flexBasis: 80,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            isLoading={isValidating}
            onReload={handleReload}
          />
        </Footer>
      </div>
      {selectedKey ? (
        <Editor
          style={{
            flex: 1,
            marginLeft: 8,
          }}
          value={selectedKey}
        />
      ) : null}
    </>
  )
}
