import ReactDOM from "react-dom/client";
import Contact from "./integrations/Contact.jsx";
import SocialLinks from "./integrations/SocialLinks.jsx";

function mountContact() {
  const oldForm = document.getElementById("contact-form");
  if (!oldForm) return;

  const action =
    oldForm.getAttribute("action") || "https://formspree.io/f/xayrzorw";

  const mount = document.createElement("div");
  oldForm.replaceWith(mount);

  ReactDOM.createRoot(mount).render(<Contact action={action} />);
}

function mountSocialLinks() {
  const mount = document.getElementById("react-social-links");
  if (!mount) return;
  ReactDOM.createRoot(mount).render(<SocialLinks />);
}

mountContact();
mountSocialLinks();
