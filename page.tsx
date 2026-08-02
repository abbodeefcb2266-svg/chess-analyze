"use client";

import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

// قطع الشطرنج بدقة عالية مخزنة داخلياً بدون الاعتماد على أي رابط خارجي
const svgPieces: Record<string, string> = {
  wP: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z' fill='%23fff' stroke='%23000' stroke-width='1.5'/></svg>",
  wN: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M22 10c-5.52 0-10 4.48-10 10 0 2.37.82 4.55 2.2 6.27C12.45 27.65 11 30.15 11 33h22c0-2.85-1.45-5.35-3.2-6.73 1.38-1.72 2.2-3.9 2.2-6.27 0-5.52-4.48-10-10-10z' fill='%23fff' stroke='%23000' stroke-width='1.5'/></svg>",
  wB: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><g fill='%23fff' stroke='%23000' stroke-width='1.5'><circle cx='22.5' cy='10' r='2.5'/><path d='M15 36c0-5 3.5-9 7.5-9s7.5 4 7.5 9H15z'/></g></svg>",
  wR: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M12 36V22h21v14H12zm2-18h17v3H14v-3z' fill='%23fff' stroke='%23000' stroke-width='1.5'/></svg>",
  wQ: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M9 36h27V20L29.5 27 22.5 13 15.5 27 9 20v16z' fill='%23fff' stroke='%23000' stroke-width='1.5'/></svg>",
  wK: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M22.5 11.5V6m-2.5 2.5h5M14 36c0-6 3.5-11 8.5-11s8.5 5 8.5 11H14z' fill='%23fff' stroke='%23000' stroke-width='1.5'/></svg>",
  bP: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z' fill='%23333' stroke='%23000' stroke-width='1.5'/></svg>",
  bN: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M22 10c-5.52 0-10 4.48-10 10 0 2.37.82 4.55 2.2 6.27C12.45 27.65 11 30.15 11 33h22c0-2.85-1.45-5.35-3.2-6.73 1.38-1.72 2.2-3.9 2.2-6.27 0-5.52-4.48-10-10-10z' fill='%23333' stroke='%23000' stroke-width='1.5'/></svg>",
  bB: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><g fill='%23333' stroke='%23000' stroke-width='1.5'><circle cx='22.5' cy='10' r='2.5'/><path d='M15 36c0-5 3.5-9 7.5-9s7.5 4 7.5 9H15z'/></g></svg>",
  bR: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M12 36V22h21v14H12zm2-18h17v3H14v-3z' fill='%23333' stroke='%23000' stroke-width='1.5'/></svg>",
  bQ: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M9 36h27V20L29.5 27 22.5 13 15.5 27 9 20v16z' fill='%23333' stroke='%23000' stroke-width='1.5'/></svg>",
  bK: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 45'><path d='M22.5 11.5V6m-2.5 2.5h5M14 36c0-6 3.5-11 8.5-11s8.5 5 8.5 11H14z' fill='%23333' stroke='%23000' stroke-width='1.5'/></svg>",
};

export default function PgnAnalyzer() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [pgnInput, setPgnInput] = useState<string>("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  const handlePgnImport = () => {
    if (!pgnInput.trim()) return;
    try {
      const tempGame = new Chess();
      tempGame.loadPgn(pgnInput);
      
      const history = tempGame.history();
      setMoveHistory(history);
      
      const newGame = new Chess();
      setGame(newGame);
      setCurrentMoveIndex(-1);
    } catch (e) {
      alert("ملف PGN غير صالح! يرجى التأكد من نص المباراة.");
    }
  };

  const goToMove = (index: number) => {
    const tempGame = new Chess();
    for (let i = 0; i <= index; i++) {
      if (i < moveHistory.length) {
        tempGame.move(moveHistory[i]);
      }
    }
    setGame(tempGame);
    setCurrentMoveIndex(index);
  };

  const customPieces = () => {
    const returnPieces: Record<string, ({ squareWidth }: { squareWidth: number }) => JSX.Element> = {};
    Object.keys(svgPieces).forEach((piece) => {
      returnPieces[piece] = ({ squareWidth }) => (
        <img
          src={svgPieces[piece]}
          alt={piece}
          style={{ width: squareWidth, height: squareWidth }}
        />
      );
    });
    return returnPieces;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold text-sky-400">محلل نقلات الشطرنج</h1>

        <div className="bg-slate-900 p-4 rounded-xl space-y-3 border border-slate-800">
          <textarea
            className="w-full bg-slate-950 p-3 text-xs font-mono text-sky-300 rounded border border-slate-800 text-left dir-ltr"
            rows={4}
            placeholder="ألصق الـ PGN هنا..."
            value={pgnInput}
            onChange={(e) => setPgnInput(e.target.value)}
          />
          <button
            onClick={handlePgnImport}
            className="bg-sky-600 hover:bg-sky-500 text-white py-2 px-6 rounded font-medium transition w-full md:w-auto"
          >
            عرض المباراة وتحليل النقلات
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-right">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[380px] aspect-square">
              <Chessboard position={game.fen()} customPieces={customPieces()} />
            </div>

            {moveHistory.length > 0 && (
              <div className="flex gap-2 mt-4 dir-ltr">
                <button
                  onClick={() => goToMove(-1)}
                  disabled={currentMoveIndex <= -1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-1 rounded text-sm font-bold"
                >
                  ⏮ بداية
                </button>
                <button
                  onClick={() => goToMove(currentMoveIndex - 1)}
                  disabled={currentMoveIndex <= -1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-4 py-1 rounded text-sm font-bold"
                >
                  ◀ السابقة
                </button>
                <button
                  onClick={() => goToMove(currentMoveIndex + 1)}
                  disabled={currentMoveIndex >= moveHistory.length - 1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-4 py-1 rounded text-sm font-bold"
                >
                  التالية ▶
                </button>
                <button
                  onClick={() => goToMove(moveHistory.length - 1)}
                  disabled={currentMoveIndex >= moveHistory.length - 1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-1 rounded text-sm font-bold"
                >
                  نهاية ⏭
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 max-h-[420px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-sky-400 mb-3 border-b border-slate-800 pb-2">
              سجل النقلات ({moveHistory.length})
            </h3>
            {moveHistory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                قم بوضع نص PGN واضغط "عرض المباراة" لظهور النقلات هنا.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1 text-xs font-mono dir-ltr">
                {moveHistory.reduce((acc: any[], move, i) => {
                  if (i % 2 === 0) {
                    acc.push({ num: Math.floor(i / 2) + 1, white: move, whiteIdx: i, black: "", blackIdx: -1 });
                  } else {
                    acc[acc.length - 1].black = move;
                    acc[acc.length - 1].blackIdx = i;
                  }
                  return acc;
                }, []).map((m) => (
                  <React.Fragment key={m.num}>
                    <div
                      onClick={() => goToMove(m.whiteIdx)}
                      className={`p-1.5 rounded cursor-pointer transition ${
                        currentMoveIndex === m.whiteIdx ? "bg-sky-600 text-white font-bold" : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      {m.num}. {m.white}
                    </div>
                    {m.black ? (
                      <div
                        onClick={() => goToMove(m.blackIdx)}
                        className={`p-1.5 rounded cursor-pointer transition ${
                          currentMoveIndex === m.blackIdx ? "bg-sky-600 text-white font-bold" : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        {m.black}
                      </div>
                    ) : <div />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
