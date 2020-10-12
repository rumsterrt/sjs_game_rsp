import React, { useState, useEffect } from 'react'
import { Collapse, Pagination, Row } from '@startupjs/ui'
import { View, Text } from 'react-native'
import './index.styl'

const CollapseHeader = Collapse.Header
const CollapseContent = Collapse.Content

const CustomTable = ({
  pagination,
  dataSource,
  columns,
  onExpand,
  expandedRowKeys,
  expandedRowRender,
  rowKey,
  ...props
}) => {
  const [columnMap, setColumnMap] = useState({})
  useEffect(() => {
    if (!columns) {
      return
    }
    setColumnMap(columns.reduce((acc, item) => ({ ...acc, [item.key]: item }), {}))
  }, [JSON.stringify(columns)])

  const renderPagination = () => {
    if (!pagination) {
      return null
    }
    const { pages, page, onChangePage } = pagination
    console.log('pagination', pagination)
    return pug`
      Row(align='center')
        Pagination(
          page=page
          pages=pages
          onChangePage=onChangePage
        )
    `
  }

  const renderRow = (row, index) => {
    if (expandedRowKeys) {
      const isOpen = expandedRowKeys.includes(rowKey(row))

      return pug`
        Collapse(key=index open=isOpen onChange=() => onExpand(!isOpen, row))
          CollapseHeader(iconPosition='right')
            View.row(key=index)
              each column in columns
                - const style = columnMap[column.key] ? {align: columnMap[column.key].style} : {}
                View.data(key=column.key style=style) #{columnMap[column.key] && columnMap[column.key].render(row)}
          CollapseContent
            =expandedRowRender(row)
    `
    }

    return pug`
      Row.row(key=index)
        each column in columns
          - const style = columnMap[column.key] ? {align: columnMap[column.key].style} : {}
          View.data(key=column.key style=style)
            if columnMap[column.key]
              =columnMap[column.key].render(row)
            else
              Text ...
    `
  }

  return pug`
    View.tableWrapper
      View.table
        View.head
          Row.row
            each column in columns
              View.headData(key=column.key)
                Text #{column.title}
        View.body
          each row, index in dataSource
            =renderRow(row, index)
      =renderPagination()
  `
}

export default CustomTable
