import { useState } from "react";

export default function Contact({ action }) {
  const [status, setStatus] = useState("idle");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const res = await fetch(action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.reset();
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <form
        id="contact-form"
        action={action}
        method="POST"
        className="mx-auto"
        onSubmit={onSubmit}
      >
        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            placeholder=" "
            required
            data-placeholder="Please enter your name"
            autoComplete="name"
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
            data-placeholder="Please enter your email id"
            autoComplete="email"
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
            data-placeholder="Please type a message you would like to send me 😊"
            autoComplete="on"
          />
          <label htmlFor="message" className="form-label">Message</label>
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-info" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send"}
          </button>
        </div>

        {status === "sent" && (
          <div style={{ textAlign: "center", marginTop: 8 }}>✅ Message sent!</div>
        )}
        {status === "error" && (
          <div style={{ textAlign: "center", marginTop: 8 }}>
            Something went wrong. Please try again.
          </div>
        )}
      </form>
    </>
  );
}
