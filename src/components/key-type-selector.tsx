import { Button, Menu, MenuItem } from '@blueprintjs/core'
import { useAppSelector, useAppDispatch } from 'hooks/use-app'
import { startCase } from 'lodash-es'
import { KeyType } from 'types'
import { actions } from 'stores'
import KeyTag from './key-tag'
import { Popover2 } from '@blueprintjs/popover2'

export default function KeyTypeSelector() {
  const keyType = useAppSelector((state) => state.keys.keyType)
  const dispatch = useAppDispatch()

  return (
    <Popover2
      boundary={
        typeof window === 'undefined' ? undefined : window.document.body
      }
      hasBackdrop={true}
      position="bottom-left"
      content={
        <Menu>
          {Object.entries(KeyType).map(([key, type]) =>
            type === KeyType.NONE ? (
              <MenuItem
                key={key}
                text="All"
                active={!keyType}
                onClick={() => {
                  dispatch(actions.keys.setKeyType(undefined))
                }}
              />
            ) : (
              <MenuItem
                key={key}
                text={startCase(type)}
                labelElement={<KeyTag type={type} />}
                active={type === keyType}
                onClick={() => {
                  dispatch(actions.keys.setKeyType(type))
                }}
              />
            ),
          )}
        </Menu>
      }
    >
      {keyType ? (
        <KeyTag type={keyType} style={{ cursor: 'pointer' }} />
      ) : (
        <Button icon="filter-list" minimal={true} />
      )}
    </Popover2>
  )
}
