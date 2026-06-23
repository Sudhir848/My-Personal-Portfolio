import { useEffect, useRef, useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");
  const [validationMsg, setValidationMsg] = useState("");
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
    setValidationMsg("");

    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

    try {
      await fetch(`${API_URL}/api/health`).catch(() => null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send");
      }

      form.reset();
      setStatus("sent");
    } catch (err) {
      console.error(err);

      let message = "Failed to send";

      if (err?.name === "AbortError") {
        message = "The server took too long to respond. It may be waking up. Please try again in a few minutes.";
      } else if (err?.message === "Failed to fetch") {
        message = "The server may be waking up. Please wait a few minutes and try again.";
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMsg(message);
      setStatus("error");
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name) {
      setValidationMsg("Please enter your name.");
      return;
    }

    if (!email) {
      setValidationMsg("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      setValidationMsg("Please enter a valid email address, like name@example.com.");
      return;
    }

    if (!message) {
      setValidationMsg("Please enter your message.");
      return;
    }

    setValidationMsg("");
    sendForm(form);
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 800 }}>
      {/* Success panel */}
      {status === "sent" && (
        <div className="contact-success-panel">
          <div className="contact-success-copy">
            <span className="contact-success-icon">
              ✅
            </span>

            <div className="contact-success-text">
              <div className="contact-success-title">
                Sent successfully!
              </div>
              <div className="contact-success-subtitle">
                Thanks for your message! I'll respond as soon as I can.
              </div>
            </div>
          </div>

          <div className="contact-success-actions">
            <button
              type="button"
              className="btn btn-info"
              onClick={() => {
                setStatus("idle");
                setErrorMsg("");
                setValidationMsg("");
                if (formRef.current) formRef.current.reset();
              }}
            >
              Send another
            </button>

            <button
              type="button"
              className="btn btn-light"
              aria-label="Close"
              onClick={() => {
                setStatus("idle");
                setValidationMsg("");
              }}
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
        onSubmit={handleSubmit}
        onInput={() => {
          setValidationMsg("");
          if (status === "error") {
            setStatus("idle");
            setErrorMsg("");
          }
        }}
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
            data-placeholder="Please type a message you would like to send me. I'll get back to you soon! 😊"
            disabled={status === "sending"}
          />
          <label htmlFor="message" className="form-label">Message</label>
        </div>

        {validationMsg && (
          <div className="form-validation-message" role="alert">
            {validationMsg}
          </div>
        )}

        <div className="form-group">
          <button
            type="submit"
            className="btn btn-info"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
