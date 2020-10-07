import React from 'react'
import { Table, Icon } from 'antd'
import { View, Text } from 'react-native'
import './index.styl'

const renderPaginationItem = (page, type, originalElement) => {
  return pug`
    case type
      when 'next'
        View.pagination
          Icon.icon(type='arrow-right' color='#535B6C')
      when 'prev'
        View.pagination
          Icon.icon(type='arrow-left' color='#535B6C')
      when 'page'
        =originalElement
      when 'jump-next'
        Text.text ...
      when 'jump-prev'
        Text.text ...
  `
}

const CustomTable = ({ pagination = {}, ...props }) => {
  const tablePagination = pagination
    ? {
        pageSizeOptions: ['10', '20', '50'],
        showSizeChanger: true,
        ...pagination
      }
    : false

  return pug`
    View.tableWrapper
      View.table
        Table(
          ...props
        )
  `
}

export default CustomTable
