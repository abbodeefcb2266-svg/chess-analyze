"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Chess } from "chess.js";

type MovePair = {
  num: number;
  white: string;
  whiteIdx: number;
  black: string;
  blackIdx: number;
};

const PIECE_SYMBOLS: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

function parseFen(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0].split("/");
  const board: (string | null)[][] = [];
  for (const row of rows) {
    const boardRow: (string | null)[] = [];
    for (const char of row) {
      if (/\d/.test(char)) {
        const emptyCount = parseInt(char);
        for (let i = 0; i < emptyCount; i++) boardRow.push(null);
      } else {
        boardRow.push(char);
      }
    }
    board.push(boardRow);
  }
  return board;
}

export default function PgnAnalyzer() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [pgnInput, setPgnInput] = useState<string>("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  const board = useMemo(() => parseFen(game.fen()), [game.fen()]);

  const movePairs = useMemo<MovePair[]>(() => {
    const pairs: MovePair[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        num: Math.floor(i / 2) + 1,
        white: moveHistory[i],
        whiteIdx: i,
        black: moveHistory[i + 1] || "",
        blackIdx: i + 1 < moveHistory.length ? i + 1 : -1,
      });
    }
    return pairs;
  }, [moveHistory]);

  const handlePgnImport = () => {
    if (!pgnInput.trim()) {
      alert("الرجاء إدخال نص PGN أولاً");
      return;
    }
    try {
      const tempGame = new Chess();
      const valid = tempGame.loadPgn(pgnInput);
      if (!valid) {
        alert("ملف PGN غير صالح! يرجى التأكد من نص المباراة.");
        return;
      }
      const history = tempGame.history();
      setMoveHistory(history);
      setGame(new Chess());
      setCurrentMoveIndex(-1);
    } catch (e) {
      alert("ملف PGN غير صالح! يرجى التأكد من نص المباراة.");
    }
  };

  const handleReset = () => {
    setGame(new Chess());
    setPgnInput("");
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
  };

  const goToMove = useCallback(
    (index: number) => {
      if (index < -1 || index >= moveHistory.length) return;
      const tempGame = new Chess();
      for (let i = 0; i <= index; i++) {
        tempGame.move(moveHistory[i]);
      }
      setGame(tempGame);
      setCurrentMoveIndex(index);
    },
    [moveHistory]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (moveHistory.length === 0) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToMove(currentMoveIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToMove(currentMoveIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMoveIndex, moveHistory, goToMove]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold text-sky-400 mb-6">محلل نقلات الشطرنج</h1>

        <div className="bg-slate-900 p-4 rounded-xl space-y-3 border border-slate-800">
          <textarea
            className="w-full bg-slate-950 p-3 text-xs font-mono text-sky-300 rounded border border-slate-800 text-left focus:outline-none focus:border-sky-500 transition"
            dir="ltr"
            rows={6}
            placeholder="ألصق الـ PGN هنا..."
            value={pgnInput}
            onChange={(e) => setPgnInput(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handlePgnImport}
              className="bg-sky-600 hover:bg-sky-500 text-white py-2 px-6 rounded font-medium transition w-full sm:w-auto"
            >
              عرض المباراة وتحليل النقلات
            </button>
            <button
              onClick={handleReset}
              className="bg-rose-600 hover:bg-rose-500 text-white py-2 px-6 rounded font-medium transition w-full sm:w-auto"
            >
              🔄 إعادة تحميل / مسح
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-right">
          <div className="flex flex-col items-center">
            {/* الرقعة مبنية من الصفر */}
            <div className="w-full max-w-[400px] mx-auto aspect-square border-2 border-slate-700 rounded overflow-hidden shadow-2xl">
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {Array.from({ length: 8 }, (_, r) =>
                  Array.from({ length: 8 }, (_, c) => {
                    const piece = board[r][c];
                    const isLight = (r + c) % 2 === 0;
                    return (
                      <div
                        key={`${r}-${c}`}
                        className="flex items-center justify-center select-none"
                        style={{
                          backgroundColor: isLight ? "#f0d9b5" : "#b58863",
                          fontSize: "clamp(1.5rem, 10vw, 3rem)",
                        }}
                      >
                        {piece && (
                          <span
                            className="font-serif"
                            style={{
                              textShadow: "0 0 3px #fff, 0 0 6px #fff",
                              color: "#1a1a1a",
                            }}
                          >
                            {PIECE_SYMBOLS[piece] || piece}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {moveHistory.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap justify-center" dir="ltr">
                <button
                  onClick={() => goToMove(-1)}
                  disabled={currentMoveIndex <= -1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm font-bold transition"
                >
                  ⏮ بداية
                </button>
                <button
                  onClick={() => goToMove(currentMoveIndex - 1)}
                  disabled={currentMoveIndex <= -1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 rounded text-sm font-bold transition"
                >
                  ◀ ترجيع
                </button>
                <button
                  onClick={() => goToMove(currentMoveIndex + 1)}
                  disabled={currentMoveIndex >= moveHistory.length - 1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 rounded text-sm font-bold transition"
                >
                  تقديم ▶
                </button>
                <button
                  onClick={() => goToMove(moveHistory.length - 1)}
                  disabled={currentMoveIndex >= moveHistory.length - 1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm font-bold transition"
                >
                  نهاية ⏭
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 max-h-[450px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-sky-400 mb-3 border-b border-slate-800 pb-2">
              سجل النقلات ({moveHistory.length})
            </h3>
            {moveHistory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                قم بوضع نص PGN واضغط &quot;عرض المباراة&quot; لظهور النقلات هنا.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1 text-xs font-mono" dir="ltr">
                <div className="text-slate-500 font-bold p-1.5 text-center sticky top-0 bg-slate-900">#</div>
                <div className="text-slate-400 font-bold p-1.5 text-center sticky top-0 bg-slate-900">أبيض</div>
                <div className="text-slate-400 font-bold p-1.5 text-center sticky top-0 bg-slate-900">أسود</div>
                {movePairs.map((m) => (
                  <React.Fragment key={m.num}>
                    <div className="text-slate-500 p-1.5 text-center">{m.num}.</div>
                    <button
                      onClick={() => goToMove(m.whiteIdx)}
                      className={`p-1.5 rounded transition text-center ${
                        currentMoveIndex === m.whiteIdx
                          ? "bg-sky-600 text-white font-bold"
                          : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      {m.white}
                    </button>
                    {m.black ? (
                      <button
                        onClick={() => goToMove(m.blackIdx)}
                        className={`p-1.5 rounded transition text-center ${
                          currentMoveIndex === m.blackIdx
                            ? "bg-sky-600 text-white font-bold"
                            : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        {m.black}
                      </button>
                    ) : (
                      <div className="p-1.5 text-slate-700 text-center">—</div>
                    )}
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
