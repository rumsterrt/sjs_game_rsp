import Games from './GamesModel'

export default function (racer) {
  racer.orm('games.*', Games)
}
