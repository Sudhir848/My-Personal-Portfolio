import { useEffect, useRef, useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef(null);

  // Re-attach placeholder/label behavior whenever the form becomes visible again (idle/error)
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // Only when form is visible
    if (status === "sent") return;

    const inputs = form.querySelectorAll(".form-control");

    const showPH = (i) => {
      if (!i.value) i.placeholder = i.dataset.placeholder || " ";
    };
    const hidePH = (i) => {
      if (!i.value) i.placeholder = " ";
    };

    inputs.forEach((input) => {
      const label = input.nextElementSibling;

      const onFocus = () => showPH(input);
      const onBlur = () => hidePH(input);
      const onEnter = () => {
        if (!label?.classList.contains("label-shifted")) showPH(input);
      };
      const onLeave = () => hidePH(input);
      const onInput = () => {
        if (input.value) label?.classList.add("label-shifted");
        else label?.classList.remove("label-shifted");
      };

      input.addEventListener("focus", onFocus);
      input.addEventListener("blur", onBlur);
      input.addEventListener("mouseenter", onEnter);
      input.addEventListener("mouseleave", onLeave);
      input.addEventListener("input", onInput);

      // store handlers for cleanup
      input._phHandlers = { onFocus, onBlur, onEnter, onLeave, onInput };

      // sync initial state
      hidePH(input);
      onInput();
    });

    return () => {
      inputs.forEach((input) => {
        const h = input._phHandlers;
        if (!h) return;
        input.removeEventListener("focus", h.onFocus);
        input.removeEventListener("blur", h.onBlur);
        input.removeEventListener("mouseenter", h.onEnter);
        input.removeEventListener("mouseleave", h.onLeave);
        input.removeEventListener("input", h.onInput);
        delete input._phHandlers;
      });
    };
  }, [status]);

  async function sendForm(form) {
    setStatus("sending");
    setErrorMsg("");

    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    try {
      const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to send");

      form.reset();
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to send");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 800 }}>
      {/* Success panel */}
      {status === "sent" && (
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto 14px",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 14,
            padding: "14px 16px",
            boxShadow: "0 16px 50px rgba(0,0,0,0.30)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(15,23,42,0.10)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 34,
                height: 34,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: "rgba(34,197,94,0.18)",
                fontSize: 18,
              }}
            >
              ✅
            </span>

            <div style={{ lineHeight: 1.2 }}>
              <div style={{ color: "#0f172a", fontWeight: 800 }}>
                Sent successfully!
              </div>
              <div style={{ fontWeight: 500, color: "#334155", fontSize: 14 }}>
                Thanks for your message! I'll reply as soon as I can.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              className="btn btn-info"
              onClick={() => {
                setStatus("idle");
                setErrorMsg("");
                if (formRef.current) formRef.current.reset();
              }}
            >
              Send another
            </button>

            <button
              type="button"
              className="btn btn-light"
              aria-label="Close"
              onClick={() => setStatus("idle")}
              style={{ padding: "6px 10px" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error panel */}
      {status === "error" && (
        <div className="alert alert-danger" role="alert" style={{ textAlign: "center" }}>
          <b>Couldn't send.</b> {errorMsg}
        </div>
      )}

      {/* Form */}
      <form
        id="contact-form"
        ref={formRef}
        className="mx-auto"
        noValidate
        style={{ display: status === "sent" ? "none" : "block" }}
      >
        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            placeholder=" "
            required
            autoComplete="name"
            data-placeholder="Please enter your name"
            disabled={status === "sending"}
          />
          <label htmlFor="name" className="form-label">Your Name</label>
        </div>

        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder=" "
            required
            autoComplete="email"
            data-placeholder="Please enter your email id"
            disabled={status === "sending"}
          />
          <label htmlFor="email" className="form-label">Email ID</label>
        </div>

        <div className="form-group">
          <textarea
            id="message"
            name="message"
            className="form-control"
            placeholder=" "
            required
            autoComplete="on"
            data-placeholder="Please type a message you would like to send me 😊"
            disabled={status === "sending"}
          />
          <label htmlFor="message" className="form-label">Message</label>
        </div>

        <div className="form-group">
          <button
            type="button"
            className="btn btn-info"
            disabled={status === "sending"}
            onClick={() => formRef.current && sendForm(formRef.current)}
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
