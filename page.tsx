"use client";

import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function PgnAnalyzer() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [pgnInput, setPgnInput] = useState<string>("");

  const handlePgnImport = () => {
    if (!pgnInput.trim()) return;
    try {
      const tempGame = new Chess();
      tempGame.loadPgn(pgnInput);
      setGame(tempGame);
    } catch (e) {
      alert("ملف PGN غير صالح!");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6" dir="rtl">
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
            className="bg-sky-600 hover:bg-sky-500 text-white py-2 px-6 rounded font-medium transition"
          >
            عرض المباراة
          </button>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-[400px] aspect-square">
            <Chessboard position={game.fen()} />
          </div>
        </div>
      </div>
    </main>
  );
}
