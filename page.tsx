"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

type MovePair = {
  num: number;
  white: string;
  whiteIdx: number;
  black: string;
  blackIdx: number;
};

// روابط صور القطع من CDN قوي + fallback نصي
const PIECE_IMAGES: Record<string, string> = {
  wP: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/wP.svg",
  wN: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/wN.svg",
  wB: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/wB.svg",
  wR: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/wR.svg",
  wQ: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/wQ.svg",
  wK: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/wK.svg",
  bP: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/bP.svg",
  bN: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/bN.svg",
  bB: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/bB.svg",
  bR: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/bR.svg",
  bQ: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/bQ.svg",
  bK: "https://cdn.jsdelivr.net/gh/lichess-org/lila/public/piece/cburnett/bK.svg",
};

const PIECE_NAMES: Record<string, string> = {
  wP: "♙", wN: "♘", wB: "♗", wR: "♖", wQ: "♕", wK: "♔",
  bP: "♟", bN: "♞", bB: "♝", bR: "♜", bQ: "♛", bK: "♚",
};

export default function PgnAnalyzer() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [pgnInput, setPgnInput] = useState<string>("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

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
      console.error("PGN Error:", e);
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

  // customPieces مع fallback نصي إذا فشلت الصورة
  const customPieces = useMemo(() => {
    const pieces = Object.keys(PIECE_IMAGES);
    const result: Record<string, React.FC<{ squareWidth: number }>> = {};
    pieces.forEach((piece) => {
      result[piece] = ({ squareWidth }: { squareWidth: number }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: squareWidth * 0.8,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          <img
            src={PIECE_IMAGES[piece]}
            alt={piece}
            width={squareWidth}
            height={squareWidth}
            style={{
              width: squareWidth,
              height: squareWidth,
              display: "block",
              position: "absolute",
            }}
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span style={{ position: "absolute", zIndex: -1 }}>
            {PIECE_NAMES[piece]}
          </span>
        </div>
      );
    });
    return result;
  }, []);

  return (
    <main
      className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold text-sky-400 mb-6">
          محلل نقلات الشطرنج
        </h1>

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
            <div className="w-full max-w-[400px] mx-auto">
              <Chessboard
                position={game.fen()}
                customPieces={customPieces}
                boardWidth={400}
                customDarkSquareStyle={{ backgroundColor: "#b58863" }}
                customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
              />
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
                <div className="text-slate-500 font-bold p-1.5 text-center sticky top-0 bg-slate-900">
                  #
                </div>
                <div className="text-slate-400 font-bold p-1.5 text-center sticky top-0 bg-slate-900">
                  أبيض
                </div>
                <div className="text-slate-400 font-bold p-1.5 text-center sticky top-0 bg-slate-900">
                  أسود
                </div>
                {movePairs.map((m) => (
                  <React.Fragment key={m.num}>
                    <div className="text-slate-500 p-1.5 text-center">
                      {m.num}.
                    </div>
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
