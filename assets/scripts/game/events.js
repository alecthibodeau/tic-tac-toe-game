'use strict'

const api = require('./api')
const logic = require('./logic')
const store = require('../store')

store.user = null
store.preGame = true

let over = false
let turnCounter = 0
let gameData = null
let cellsIndex = null
let playerPiece = null
let cells = ['', '', '', '', '', '', '', '', '']

// Game logic is now in separate file: logic.js. Game ui is now in separate file: ui.js
const onClickCell = function (event) {
  event.preventDefault()
  cellsIndex = this.getAttribute('data-id')
  turnCounter % 2 === 0 ? playerPiece = 'x' : playerPiece = 'o'
  turnCounter % 2 !== 0 ? $('#game-status').text(`player x's turn`).removeClass('o') : $('#game-status').text(`player o's turn`).addClass('o')
  cells[cellsIndex] = playerPiece
  $(this).addClass(`${playerPiece}`).addClass('played').unbind('click', onClickCell)
  document.querySelector('#' + this.getAttribute('id')).innerHTML = playerPiece
  // console.log(`cell index: ${cellsIndex}`)
  // console.log(`Win value: ${winValue}`)
  // console.log(`Cells array: ${cells}`)
  // console.log(`Game is over? ${over}`)
  turnCounter++
  logic.checkForMatch(cells, over, turnCounter, gameData, cellsIndex, playerPiece, onClickCell)
}

const animateGameBoard = function () {
  if (store.preGame === true) {
    $('.board-cell').addClass('starting-blue')
    for (let i = 0; i < 9; i++) {
      if (i % 2 === 0) {
        $(`#cell-${i}`).addClass('pre-game')
      } else if (i % 2 !== 0) {
        setTimeout(function () { $(`#cell-${i}`).addClass('pre-game') }, 1000)
      }
    }
  }
}

const createGameBoard = function () {
  for (let i = 0; i < cells.length; i++) {
    const elementCell = document.createElement('div')
    elementCell.setAttribute('class', 'board-cell')
    elementCell.setAttribute('data-id', i)
    elementCell.setAttribute('id', 'cell-' + i)
    document.getElementById('game-board').appendChild(elementCell)
  }
  $('.board-cell').addClass('played').addClass('game-over') // PUT PREGAME BACK HERE
  // console.log('Board created.')
  if (store.preGame === true) {
    animateGameBoard()
  }
}

const createBackground = function () {
  for (let i = 0; i < 10; i++) {
    const backgroundBar = document.createElement('div')
    backgroundBar.setAttribute('class', 'background-bar')
    $(backgroundBar).addClass(`bg-bar-${i}`)
    document.getElementById('background-container').appendChild(backgroundBar)
  }
}

const setNewGame = function () {
  console.log('Hi')
  store.preGame = false
  over = false
  turnCounter = 0
  cells = ['', '', '', '', '', '', '', '', '']
  $('#game-board').html('')
  createGameBoard()
  $('.board-grid').removeClass('x-won').removeClass('o-won').addClass('playable')
  $('.game-status-area').removeClass('game-result').removeClass('o').text(`player x's turn`).addClass('playable')
  $('.board-cell').on('click', onClickCell).removeClass('pre-game').removeClass('starting-blue').removeClass('played').removeClass('game-over')
  $('.game-status-area').addClass('playable')
  $('.game-session-area').addClass('playable')
  if (store.user !== null) {
    api.createGame()
      .then((result) => {
        // console.log(result)
        gameData = result
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

const onClickNewGame = function (event) {
  event.preventDefault()
  setNewGame()
}

const onRetrieveOverGames = function () {
  event.preventDefault()
  let statsOverGames = null
  let xStatsWins = null
  let oStatsWins = null
  let drawGames = null
  api.retrieveOverGames()
    .then((result) => {
      statsOverGames = result
      // console.log(statsOverGames)
      // console.log(over)
      for (let i = 0; i < statsOverGames.games.length; i++) {
        const elementGamesOver = document.createElement('div')
        elementGamesOver.setAttribute('id', 'stats-games-over-' + i)
        elementGamesOver.setAttribute('class', 'states-games-over-element')
        document.getElementById('stats-games-over').appendChild(elementGamesOver)
        document.getElementById('stats-games-over-' + i).innerHTML = 'Game #' + (i + 1) + '… ' + logic.checkStatsForMatch(statsOverGames.games[i].cells, 'Draw') + ' with these moves: ' + statsOverGames.games[i].cells
        if (logic.checkStatsForMatch(statsOverGames.games[i].cells, 'draw') === 'X won') {
          xStatsWins = (xStatsWins + 1)
        } else if (logic.checkStatsForMatch(statsOverGames.games[i].cells, 'draw') === 'O won') {
          oStatsWins = (oStatsWins + 1)
        } else {
          drawGames = (drawGames + 1)
        }
      }
      if (xStatsWins === null) {
        xStatsWins = 0
      }
      if (oStatsWins === null) {
        oStatsWins = 0
      }
      if (drawGames === null) {
        drawGames = 0
      }
      const totalGamesPlayed = xStatsWins + oStatsWins + drawGames
      document.getElementById('stats-total-games-over').innerHTML = `Total games played: ${totalGamesPlayed}`
      document.getElementById('stats-sum-games-over').innerHTML = `Player X wins: ${xStatsWins}, Player O wins: ${oStatsWins}, Draws: ${drawGames}`
    })
    .catch((err) => {
      console.log(err)
    })
}

const addGameHandlers = () => {
  $('#new-game').on('click', onClickNewGame)
  $('#nav-game-stats').on('click', onRetrieveOverGames)
  $('.user-buttons').hide()
}

module.exports = {
  createBackground,
  createGameBoard,
  animateGameBoard,
  setNewGame,
  addGameHandlers
}

// event listeners which bind handlers to events on elements
// two types:
//   API request handlers
//   UI handlers
