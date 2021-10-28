import { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isEqual } from 'lodash'
import { KeyType } from 'types'
import { actions } from 'stores'
import KeyTag from './key-tag'
import InfiniteListItem from './pure/infinite-list-item'

export default function KeyItem(props: {
  value: { key: string; type: KeyType }
}) {
  const selectedKey = useSelector((state) => state.keys.selectedKey)
  const match = useSelector((state) => state.keys.match)
  const isPrefix = useSelector((state) => state.keys.isPrefix)
  const dispatch = useDispatch()
  const item = props.value
  const handleSelect = useCallback(
    (isSelected: boolean) => {
      dispatch(actions.keys.setSelectedKey(isSelected ? item : undefined))
    },
    [dispatch, item],
  )
  const str = useMemo(() => {
    try {
      return isPrefix && match
        ? item.key.replace(new RegExp(`^${match}`), '')
        : item.key
    } catch {
      return item.key
    }
  }, [isPrefix, item.key, match])

  return (
    <InfiniteListItem
      isSelected={isEqual(selectedKey, item)}
      onSelect={handleSelect}
    >
      <KeyTag type={item.type} />
      &nbsp;
      <span title={item.key}>
        {item.key !== str ? <span style={{ opacity: 0.5 }}>…</span> : null}
        {str}
      </span>
    </InfiniteListItem>
  )
}
