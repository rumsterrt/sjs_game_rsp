export default (components = {}) => [
  {
    path: '/',
    exact: true,
    component: components.PHome
  },
  {
    path: '/login',
    exact: true,
    component: components.PLogin
  },
  {
    path: '/game/:gameId',
    exact: true,
    component: components.PGame
  },
  {
    path: '/game/:gameId/chronology',
    exact: true,
    component: components.PGameChronology
  },
  {
    path: '/leaderboard',
    exact: true,
    component: components.PLeaderboard
  },
  {
    path: '/pastgames',
    exact: true,
    component: components.PPastGames
  }
]
