import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Simple Tic Tac Toe frontend app with:
 * - Landing screen
 * - Mode selection: Human vs Human or Human vs Computer
 * - Game board with status, reset, and move history
 * - Basic AI (minimax with pruning for optimal play)
 * - Light/Dark theme toggle
 */

/**
 * Types and constants
 */
const EMPTY = null;
const PLAYER_X = 'X';
const PLAYER_O = 'O';
const GameMode = {
  PVP: 'PVP',
  PVC: 'PVC',
};

/**
 * Utility: Calculate winner and status
 */
// PUBLIC_INTERFACE
export function calculateWinner(squares) {
  /** Determine the winner or draw for a given 3x3 board.
   * Returns:
   * - { winner: 'X'|'O', line: [i,j,k] } if there is a winner
   * - { winner: null, draw: true } if board is full and no winner
   * - { winner: null, draw: false } otherwise
   */
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diags
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c], draw: false };
    }
  }
  if (squares.every(s => s !== EMPTY)) {
    return { winner: null, line: null, draw: true };
  }
  return { winner: null, line: null, draw: false };
}

/**
 * Utility: Minimax AI for the computer player (O by default).
 * This AI will always play optimally for standard 3x3 Tic Tac Toe.
 */
function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === EMPTY) moves.push(i);
  }
  return moves;
}

function evaluate(board) {
  const { winner, draw } = calculateWinner(board);
  if (winner === PLAYER_O) return +10;
  if (winner === PLAYER_X) return -10;
  if (draw) return 0;
  return null; // not terminal
}

function minimax(board, isMaximizing, alpha, beta, depth = 0) {
  const score = evaluate(board);
  if (score !== null) {
    // Prefer faster wins and slower losses
    return score - depth * Math.sign(score || 1);
  }

  if (isMaximizing) {
    let best = -Infinity;
    let bestMove = -1;
    for (const move of availableMoves(board)) {
      board[move] = PLAYER_O;
      const value = minimax(board, false, alpha, beta, depth + 1);
      board[move] = EMPTY;
      if (value > best) {
        best = value;
        bestMove = move;
      }
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return depth === 0 ? bestMove : best;
  } else {
    let best = Infinity;
    let bestMove = -1;
    for (const move of availableMoves(board)) {
      board[move] = PLAYER_X;
      const value = minimax(board, true, alpha, beta, depth + 1);
      board[move] = EMPTY;
      if (value < best) {
        best = value;
        bestMove = move;
      }
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return depth === 0 ? bestMove : best;
  }
}

// PUBLIC_INTERFACE
export function computeBestMove(board) {
  /** Compute the best move index for the computer (O) on the given board. */
  return minimax([...board], true, -Infinity, Infinity, 0);
}

/**
 * UI Components
 */

// Square component
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square ${highlight ? 'highlight' : ''}`}
      onClick={onClick}
      aria-label={`Cell ${value || 'empty'}`}
    >
      {value}
    </button>
  );
}

// Board component
function Board({ squares, onSquareClick, winningLine }) {
  const renderSquare = (i) => {
    const highlight = winningLine ? winningLine.includes(i) : false;
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onSquareClick(i)}
        highlight={highlight}
      />
    );
  };

  return (
    <div className="board">
      <div className="board-row">{[0, 1, 2].map(renderSquare)}</div>
      <div className="board-row">{[3, 4, 5].map(renderSquare)}</div>
      <div className="board-row">{[6, 7, 8].map(renderSquare)}</div>
    </div>
  );
}

// Status bar component
function StatusBar({ status, onReset, onBack }) {
  return (
    <div className="status-bar">
      <div className="status-text">{status}</div>
      <div className="actions">
        <button className="btn" onClick={onBack} aria-label="Back to menu">← Menu</button>
        <button className="btn btn-primary" onClick={onReset} aria-label="Reset game">↻ Reset</button>
      </div>
    </div>
  );
}

// Landing / Mode selection
function Landing({ theme, toggleTheme, onSelectMode }) {
  return (
    <div className="landing">
      <header className="navbar">
        <div className="brand">Tic Tac Toe</div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch theme`}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <main className="container">
        <h1 className="title">Welcome to Tic Tac Toe</h1>
        <p className="subtitle">Choose your opponent to start playing</p>
        <div className="card">
          <button className="btn btn-large btn-primary" onClick={() => onSelectMode(GameMode.PVC)}>
            Play vs Computer
          </button>
          <button className="btn btn-large" onClick={() => onSelectMode(GameMode.PVP)}>
            Play vs Human
          </button>
        </div>
        <footer className="footer">Built with React • No frameworks, pure CSS</footer>
      </main>
    </div>
  );
}

// Game screen
function GameScreen({ mode, onBack, theme, toggleTheme }) {
  const [history, setHistory] = useState([[...Array(9).fill(EMPTY)]]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const result = useMemo(() => calculateWinner(currentSquares), [currentSquares]);

  const statusText = useMemo(() => {
    if (result.winner) return `Winner: ${result.winner} 🎉`;
    if (result.draw) return "It's a draw! 🤝";
    return `Next player: ${xIsNext ? PLAYER_X : PLAYER_O}`;
  }, [result, xIsNext]);

  const makeMove = (i) => {
    // ignore if finished or occupied
    if (result.winner || result.draw || currentSquares[i]) return;
    const next = currentSquares.slice();
    next[i] = xIsNext ? PLAYER_X : PLAYER_O;
    const newHistory = history.slice(0, currentMove + 1).concat([next]);
    setHistory(newHistory);
    setCurrentMove(newHistory.length - 1);
  };

  // Computer move for PVC
  useEffect(() => {
    if (mode !== GameMode.PVC) return;
    if (result.winner || result.draw) return;
    if (!xIsNext) {
      const idx = computeBestMove(currentSquares);
      // slight delay for better UX
      const t = setTimeout(() => {
        makeMove(idx);
      }, 300);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentSquares, xIsNext, result.winner, result.draw]);

  const handleSquareClick = (i) => {
    // in PVC, only allow clicks when it's player's (X) turn
    if (mode === GameMode.PVC && !xIsNext) return;
    makeMove(i);
  };

  const resetGame = () => {
    setHistory([[...Array(9).fill(EMPTY)]]);
    setCurrentMove(0);
  };

  const jumpTo = (move) => {
    setCurrentMove(move);
  };

  return (
    <div className="game-screen">
      <header className="navbar">
        <div className="brand">Tic Tac Toe</div>
        <div className="nav-actions">
          <span className="mode-pill">{mode === GameMode.PVC ? 'Vs Computer' : 'Vs Human'}</span>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch theme`}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="container">
        <StatusBar status={statusText} onReset={resetGame} onBack={onBack} />
        <div className="game">
          <Board
            squares={currentSquares}
            onSquareClick={handleSquareClick}
            winningLine={result.line}
          />
          <div className="game-info">
            <h3>Move History</h3>
            <ol className="history">
              {history.map((_, move) => {
                const desc = move ? `Go to move #${move}` : 'Go to game start';
                return (
                  <li key={move}>
                    <button
                      className={`btn btn-small ${move === currentMove ? 'btn-active' : ''}`}
                      onClick={() => jumpTo(move)}
                    >
                      {desc}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root application component controlling navigation and theme. */
  const [theme, setTheme] = useState('light');
  const [mode, setMode] = useState(null); // null => landing, else GameMode

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectMode = (m) => setMode(m);
  const handleBackToMenu = () => setMode(null);

  return (
    <div className="App">
      {!mode ? (
        <Landing theme={theme} toggleTheme={toggleTheme} onSelectMode={handleSelectMode} />
      ) : (
        <GameScreen
          mode={mode}
          onBack={handleBackToMenu}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
