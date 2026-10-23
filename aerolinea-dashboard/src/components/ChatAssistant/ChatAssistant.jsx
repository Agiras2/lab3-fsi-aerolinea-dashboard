// ChatAssistant.jsx — Componente de Asistente IA conectado a webhook de n8n

import { useState, useEffect, useRef } from "react";
import styles from "./ChatAssistant.module.css";

const WEBHOOK_URL = "https://udea.app.n8n.cloud/webhook/402b40f0-fbc0-4051-a3e9-3770a7477067";

// Icono de mensaje / chat para el botón de apertura
const ChatBubbleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Icono de enviar (avión de papel)
const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function ChatAssistant({ context = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hola, soy tu asistente comercial. Puedo ayudarte a interpretar los KPIs del panel. ¿Qué quieres revisar?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const sessionIdRef = useRef("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Inicializar sessionId una sola vez al montar el componente
  useEffect(() => {
    let sid = null;
    try {
      sid = sessionStorage.getItem("chat_session_id");
    } catch (e) {
      console.error("Error al acceder a sessionStorage:", e);
    }

    if (!sid) {
      sid =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      try {
        sessionStorage.setItem("chat_session_id", sid);
      } catch (e) {
        console.error("Error al guardar en sessionStorage:", e);
      }
    }

    sessionIdRef.current = sid;
  }, []);

  // Scroll automático cada vez que hay nuevos mensajes o cambia el estado de carga
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Enfocar input cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || loading) return;

    // Agregar mensaje del usuario a la lista
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          sessionId: sessionIdRef.current,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || typeof data.response !== "string") {
        throw new Error("Formato de respuesta inesperado del asistente");
      }

      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: data.response },
      ]);
    } catch (error) {
      console.error("Error al conectar con el webhook del asistente:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "No pude conectarme con el asistente. Intenta de nuevo.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* ── Tarjeta en la columna lateral derecha ── */}
      <div className={styles.triggerCard}>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>Asistente IA</h3>
          <p className={styles.cardSubtitle}>
            ¿Necesitas ayuda con tus métricas?
          </p>
        </div>
        <button
          type="button"
          className={styles.openBtn}
          onClick={() => setIsOpen((prev) => !prev)}
          title="Abrir Asistente IA"
          aria-label="Abrir Asistente IA"
        >
          <ChatBubbleIcon />
        </button>
      </div>

      {/* ── Panel de chat flotante ── */}
      {isOpen && (
        <div className={styles.chatPanel} role="dialog" aria-label="Asistente IA">
          {/* Cabecera */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatar}>
                🤖
              </div>
              <div className={styles.headerText}>
                <span className={styles.headerTitle}>Asistente IA</span>
                <span className={styles.headerStatus}>
                  <span className={styles.onlineDot} />
                  En línea
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Área de mensajes con scroll */}
          <div className={styles.messagesArea}>
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={index}
                  className={`${styles.messageRow} ${
                    isUser ? styles.messageRowUser : styles.messageRowAssistant
                  }`}
                >
                  <div
                    className={
                      isUser
                        ? styles.userBubble
                        : msg.isError
                        ? styles.errorBubble
                        : styles.assistantBubble
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Tres puntos animados mientras espera respuesta */}
            {loading && (
              <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                <div className={styles.typingBubble}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Barra inferior con input y botón de enviar */}
          <form className={styles.inputForm} onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              className={styles.textInput}
              placeholder={loading ? "Esperando respuesta..." : "Escribe tu consulta..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={loading || !inputText.trim()}
              title="Enviar mensaje"
              aria-label="Enviar mensaje"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
