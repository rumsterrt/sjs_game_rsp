import React, { useState, useEffect } from 'react'
import { Collapse, Pagination, Row, H3 } from '@startupjs/ui'
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
  title,
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
          CollapseHeader(iconPosition='left')
            View.row(key=index)
              each column, colIndex in columns
                - const style = columnMap[column.key] ? {align: columnMap[column.key].style} : {}
                View.data(
                  key=column.key
                  style=style
                  styleName=[{first: colIndex === 0, last:colIndex === columns.length - 1}]
                ) #{columnMap[column.key] && columnMap[column.key].render(row)}
          CollapseContent.collapseContent
            =expandedRowRender(row)
    `
    }

    return pug`
      Row.row(key=index)
        each column, colIndex in columns
          - const style = columnMap[column.key] ? {align: columnMap[column.key].style} : {}
          View.data(
            key=column.key
            style=style
            styleName=[{first: colIndex === 0, last:colIndex === columns.length - 1}]
          )
            if columnMap[column.key]
              =columnMap[column.key].render(row)
            else
              Text ...
    `
  }

  return pug`
    if title
      Row.header
        H3 #{title}
    View.tableWrapper
      View.table
        View.head
          Row.row.top
            each column, index in columns
              View.headData(key=column.key styleName=[{first: index === 0, last:index === columns.length - 1}])
                Text.headText #{column.title}
        View.body
          each row, index in dataSource
            =renderRow(row, index)
      =renderPagination()
  `
}

export default CustomTable
