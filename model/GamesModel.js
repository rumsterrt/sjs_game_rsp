import { BaseModel } from 'startupjs/orm'
import _get from 'lodash/get'
import _maxBy from 'lodash/maxBy'
import _cloneDeep from 'lodash/cloneDeep'
import _toPairs from 'lodash/toPairs'
import _difference from 'lodash/difference'

const responseType = {
  rock: 'rock',
  scissors: 'scissors',
  paper: 'paper',
  pass: 'pass'
}

const winnerMap = {
  [responseType.rock]: [responseType.rock, responseType.scissors],
  [responseType.paper]: [responseType.rock, responseType.paper],
  [responseType.scissors]: [responseType.scissors, responseType.paper]
}

const getWinner = (playersMap) => {
  const responses = Object.keys(playersMap)
  if (responses.length === 1) {
    return 'draw'
  }

  const result = _toPairs(winnerMap).find((item) => _difference(item[1], responses).length === 0)

  return playersMap[result[0]]
}

export default class GamesModel extends BaseModel {
  async getCurrentRound() {
    const { id: gameId } = this.get()
    const model = this.root
    const $rounds = this.query('rounds', { gameId })
    await $rounds.fetch()
    const rounds = $rounds.get()
    let round = _maxBy(rounds, (item) => item.gameIndex)
    const prevRound = !round
      ? null
      : round.winnerId
      ? round
      : rounds.find((item) => item.gameIndex === round.gameIndex - 1)
    if (!round || round.winnerId) {
      round = {
        id: model.id(),
        gameId,
        gameIndex: rounds.length,
        winnerId: null,
        players: {}
      }
      await this.root.addAsync('rounds', round)
    }
    return { currentRound: round, prevRound }
  }

  _calculateRoundResults(game, currentRound, prevRound, player1Id, player2Id) {
    const players = _cloneDeep(currentRound.players)
    const response1 = _get(players, `${player1Id}.response`)
    const response2 = _get(players, `${player2Id}.response`)
    let winnerId

    if (response1 === responseType.pass) {
      winnerId = player2Id
    }
    if (response2 === responseType.pass) {
      winnerId = player1Id
    }
    // If nobody pass and one of them have no response then skip
    if ((!response1 || !response2) && !winnerId) {
      return { players }
    }
    if (!winnerId) {
      winnerId = getWinner({
        [response1]: player1Id,
        [response2]: player2Id
      })
    }
    const winnerHasCombo = prevRound && (prevRound.winnerId === 'draw' || prevRound.winnerId === winnerId)
    const getPoints = (id) =>
      _get(prevRound, `players.${id}.points`, 0) +
      (winnerId === id ? (winnerHasCombo ? _get(prevRound, `players.${id}.points`, 1) : 1) : 0)

    return {
      winnerId,
      players: {
        [player1Id]: {
          response: response1,
          points: getPoints(player1Id)
        },
        [player2Id]: {
          response: response2,
          points: getPoints(player2Id)
        }
      }
    }
  }

  async responseCurrentRound(playerId, responseType) {
    const { id: gameId } = this.get()
    const { currentRound, prevRound } = await this.getCurrentRound()
    const $game = this.scope(`games.${gameId}`)
    await $game.fetch()
    const game = $game.get()
    // Check player exists in game
    if (!game.playersIds.includes(playerId)) {
      return
    }
    const playerData = currentRound.players[playerId]
    // Check player didn't already response
    if (playerData && playerData.response) {
      return
    }
    const otherPlayerId = game.playersIds.filter((id) => id !== playerId)[0]
    // Check other player exists
    if (!otherPlayerId) {
      return
    }

    const updatedCurrentRound = _cloneDeep(currentRound)
    updatedCurrentRound.players[playerId] = { response: responseType }
    const roundNewData = this._calculateRoundResults(game, updatedCurrentRound, prevRound, playerId, otherPlayerId)

    const $round = this.scope(`rounds.${currentRound.id}`)
    $round.setEach(roundNewData)
  }
}
