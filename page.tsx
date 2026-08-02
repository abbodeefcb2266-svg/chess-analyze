"use client";

import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function PgnAnalyzer() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [pgnInput, setPgnInput] = useState<string>("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  // استيراد المباراة وتحليل النقلات
  const handlePgnImport = () => {
    if (!pgnInput.trim()) return;
    try {
      const tempGame = new Chess();
      tempGame.loadPgn(pgnInput);
      
      const history = tempGame.history();
      setMoveHistory(history);
      
      // تعيين اللوحة على الوضع الابتدائي
      const newGame = new Chess();
      setGame(newGame);
      setCurrentMoveIndex(-1);
    } catch (e) {
      alert("ملف PGN غير صالح! يرجى التأكد من نص المباراة.");
    }
  };

  // التنقل بين النقلات
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

  // رابط قطع الشطرنج المباشر لضمان ظهور الصور بدون مشاكل
  const customPieces = () => {
    const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];
    const returnPieces: Record<string, ({ squareWidth }: { squareWidth: number }) => JSX.Element> = {};

    pieces.forEach((piece) => {
      returnPieces[piece] = ({ squareWidth }) => (
        <img
          src={`https://chessboardjs.com/img/chesspieces/wikipedia/${piece}.png`}
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

        {/* إدخال الـ PGN */}
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

        {/* رقعة الشطرنج وأزرار التحكم */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-right">
          
          {/* الرقعة */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[380px] aspect-square">
              <Chessboard position={game.fen()} customPieces={customPieces()} />
            </div>

            {/* أزرار التنقل بين النقلات */}
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

          {/* قائمة النقلات */}
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
