import React from 'react'
import { useQuery } from 'startupjs'

export default (collection, { query = {}, limit = 10, initPage = 0 }) => {
  const [currentPage, setCurrentPage] = React.useState(initPage)
  const [data = [], $data] = useQuery(collection, {
    ...query,
    $limit: limit,
    $skip: limit * currentPage
  })
  const [totalCount = 0] = useQuery(collection, {
    ...query,
    $count: true
  })
  const pagination = {
    page: currentPage,
    pages: Math.ceil(totalCount / limit),
    onChangePage: setCurrentPage
  }

  return [{ totalCount, items: data || [], pagination }, $data]
}
