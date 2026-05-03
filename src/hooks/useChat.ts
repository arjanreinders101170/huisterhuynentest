import { useState, useRef } from "react"

export function useChat() {
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Welkom! Ik ben de Huynen Host 🌿" }
  ])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  const send = async () => {
    if (!input.trim() || busy) return

    const q = input.trim()
    setInput("")

    setMsgs(prev => {
      const updated = [...prev, { role: "user", text: q }]

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map(m => ({
            role: m.role,
            content: m.text
          }))
        })
      })
        .then(r => r.json())
        .then(d => {
          setMsgs(p => [...p, { role: "assistant", text: d.reply }])
        })
        .catch(() => {
          setMsgs(p => [...p, { role: "assistant", text: "Fout 😕" }])
        })

      return updated
    })
  }

  return { msgs, input, setInput, send, busy, endRef }
}