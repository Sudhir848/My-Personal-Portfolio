import { useEffect, useRef, useState } from "react";

export default function Contact({ action }) {
  const formRef = useRef(null);
  const savedRef = useRef({ name: "", email: "", message: "" });

  const MSG_LIMIT = 1000;
  const DRAFT_KEY = "contactDraft.v2";

  // Read any existing draft once (init state without a useEffect)
  const initialDraft = (() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      void e; // ignore parse errors
      return null;
    }
  })();

  // Controlled fields
  const [name, setName] = useState(initialDraft?.name || "");
  const [email, setEmail] = useState(initialDraft?.email || "");
  const [message, setMessage] = useState(initialDraft?.message || "");

  // Other UI state
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errors, setErrors] = useState({});
  const [lastSavedAt, setLastSavedAt] = useState(initialDraft?.savedAt ?? null);
  const [hasDraft, setHasDraft] = useState(!!initialDraft);

  // Keep a snapshot of the last saved values (for "dirty" check)
  savedRef.current = {
    name: hasDraft ? (initialDraft?.name ?? savedRef.current.name) : savedRef.current.name,
    email: hasDraft ? (initialDraft?.email ?? savedRef.current.email) : savedRef.current.email,
    message: hasDraft ? (initialDraft?.message ?? savedRef.current.message) : savedRef.current.message,
  };

  // ---- width/centering only (won't fight your existing styles) ----
  useEffect(() => {
    const css = `
      :root { --contact-form-max: 1320px; } /* tweak to taste */

      #contact-form, #contact-form.mx-auto{
        width: min(var(--contact-form-max), 96vw) !important;
        max-width: none !important;
        margin-left: auto !important;
        margin-right: auto !important;
        box-sizing: border-box;
      }

      #contact-form .form-group{ width:100%; overflow:visible; }
      #contact-form .form-control, #contact-form .btn{ width:100%; }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // ---- validation (simple and local) ----
  const validators = {
    name: (v) => (!v || v.trim().length < 2 ? "Please enter your name" : ""),
    email: (v) =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Please enter a valid email" : "",
    message: (v) =>
      !v || v.trim().length < 5 ? "Please enter a message" : "",
  };

  useEffect(() => {
    const eMap = {};
    const nErr = validators.name(name);
    const eErr = validators.email(email);
    const mErr = validators.message(message);
    if (nErr) eMap.name = nErr;
    if (eErr) eMap.email = eErr;
    if (mErr) eMap.message = mErr;
    setErrors(eMap);
  }, [name, email, message]); // validators are static

  const isValid = Object.keys(errors).length === 0;
  const msgLen = message.length;
  const percent = Math.min(100, (msgLen / MSG_LIMIT) * 100);

  // ---- initialize floating placeholders once ----
  useEffect(() => {
    formRef.current
      ?.querySelectorAll(".form-control")
      ?.forEach((el) => {
        if (!el.value?.trim()) el.setAttribute("placeholder", " ");
      });
  }, []);

  // ---- auto-save draft (debounced) ----
  useEffect(() => {
    if (!name && !email && !message) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {
        void e;
      }
      setHasDraft(false);
      setLastSavedAt(null);
      savedRef.current = { name: "", email: "", message: "" };
      return;
    }

    const t = setTimeout(() => {
      const now = new Date().toISOString();
      const payload = { name, email, message, savedAt: now };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      } catch (e) {
        void e; // ignore quota
      }
      savedRef.current = { name, email, message };
      setHasDraft(true);
      setLastSavedAt(now);
    }, 500);

    return () => clearTimeout(t);
  }, [name, email, message]);

  // ---- unsaved changes (compare against last saved snapshot) ----
  const dirty =
    name !== savedRef.current.name ||
    email !== savedRef.current.email ||
    message !== savedRef.current.message;

  // ---- guard when leaving the page with unsent changes ----
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!submitting && dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, submitting]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      void e;
    }
    savedRef.current = { name: "", email: "", message: "" };
    setHasDraft(false);
    setLastSavedAt(null);
  };

  // ---- submit to Formspree (keeps your action URL) ----
  async function onSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (!isValid) {
      const first = formRef.current?.querySelector('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("message", message);

      const res = await fetch(action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      clearDraft();
    } catch (err) {
      console.error("Contact submit failed:", err);
      setStatus("error");
      try {
        formRef.current?.submit();
      } catch (err2) {
        void err2; // keep eslint happy
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Format saved timestamp
  const fmtSaved = (() => {
    if (!lastSavedAt) return null;
    try {
      const d = new Date(lastSavedAt);
      return d.toLocaleString();
    } catch (e) {
      void e;
      return lastSavedAt;
    }
  })();

  return (
    <div className="contact-react">
      <form
        id="contact-form"
        ref={formRef}
        action={action}
        method="POST"
        className="mx-auto"
        noValidate
        onSubmit={onSubmit}
        aria-describedby="contact-status"
      >
        {/* Name */}
        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=" "
            data-placeholder="Please enter your name"
            required
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby="name-error"
          />
          <label htmlFor="name" className="form-label">Your Name</label>
          {errors.name && (
            <div id="name-error" className="invalid-feedback" role="alert">
              {errors.name}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            data-placeholder="Please enter your email id"
            required
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-error"
          />
          <label htmlFor="email" className="form-label">Email ID</label>
          {errors.email && (
            <div id="email-error" className="invalid-feedback" role="alert">
              {errors.email}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="form-group">
          <textarea
            id="message"
            name="message"
            className="form-control"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder=" "
            data-placeholder="Please type a message you would like to send"
            required
            autoComplete="on"
            maxLength={MSG_LIMIT}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby="message-error"
            style={{ minHeight: "120px", resize: "none" }}
          />
          <label htmlFor="message" className="form-label">Message</label>
          {errors.message && (
            <div id="message-error" className="invalid-feedback" role="alert">
              {errors.message}
            </div>
          )}

          {/* Accessible, CSS-agnostic progress meter */}
          <div style={{ marginTop: 8 }}>
            <progress
              max={MSG_LIMIT}
              value={msgLen}
              style={{ width: "100%", height: 10 }}
              aria-label="Characters used"
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 6,
                fontSize: ".95rem",
                color: "#fff",
                textShadow: "0 1px 0 rgba(0,0,0,.35)",
              }}
            >
              <span>{msgLen} / {MSG_LIMIT}</span>
              <span>{percent < 100 ? "Type away…" : "Limit reached"}</span>
            </div>
          </div>
        </div>

        {/* Draft status / controls */}
        <div
          className="form-group"
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12
          }}
        >
          <small style={{ opacity: 0.9 }}>
            {fmtSaved
              ? `Draft auto-saved: ${fmtSaved}`
              : hasDraft
              ? "Draft saved"
              : "Drafts auto-save as you type"}
          </small>
          {hasDraft && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                clearDraft();
                setName("");
                setEmail("");
                setMessage("");
              }}
              style={{ padding: "6px 10px" }}
            >
              Clear draft
            </button>
          )}
        </div>

        {/* Submit */}
        <div className="form-group">
          <button type="submit" className="btn btn-info" disabled={!isValid || submitting}>
            {submitting ? "Sending…" : "Send"}
          </button>
        </div>

        {/* Live status */}
        <div id="contact-status" aria-live="polite">
          {status === "success" && (
            <div className="alert alert-success" role="status">
              Thanks! Your message has been sent.
            </div>
          )}
          {status === "error" && (
            <div className="alert alert-danger" role="status">
              Sorry—something went wrong. Please try again.
            </div>
          )}
        </div>

        <input
          type="text"
          name="company"
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
        />
      </form>
    </div>
  );
}
