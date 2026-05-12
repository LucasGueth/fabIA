"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  let storedSessionId = localStorage.getItem("student_session_id");

  if (!storedSessionId) {
    storedSessionId = crypto.randomUUID();
    localStorage.setItem("student_session_id", storedSessionId);
  }

  setSessionId(storedSessionId);
}, []);

  async function askAgent() {
    if (!message.trim()) return;

    setLoading(true);
    setAnswer("");
    setMessage("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message, sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAnswer(data.error ?? "Une erreur est survenue.");
        return;
      }

      setAnswer(
        typeof data.answer === "string"
          ? data.answer
          : JSON.stringify(data.answer, null, 2)
      );
    } catch {
      setAnswer("Impossible de contacter l’agent pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
            FabIA: L'intelligence artificielle du Makerspace
          </p>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Assistant intelligent du FabLab
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Pose une question par rapport aux machines du FabLab, ou bien demande à créer ton propre projet personnalisé selon tes moyens et tes compétences
          </p>
        </div>

        <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Ici, ca chat
          </label>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                askAgent();
              }
            }}
            placeholder="Exemple : quelles sont les machines disponibles au makerspace? ..."
            className="mb-4 min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-blue-500"
          />

          <button
            onClick={askAgent}
            disabled={loading}
            className="w-full rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "L’agent réfléchit..." : "Demander à l’agent"}
          </button>

          {answer && (
            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="mb-2 text-sm font-semibold text-blue-400">
                Réponse de l’agent
              </p>
              <p className="whitespace-pre-wrap text-slate-200">{answer}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}