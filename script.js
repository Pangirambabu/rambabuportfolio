"use strict";

/* Agency Connect page interactions.
   Account features in this front-end demo validate form fields only. LocalStorage
   keeps a user's display name and email; never store passwords in the browser.
*/

// Wait until the document is ready before finding or creating page elements.
document.addEventListener("DOMContentLoaded", () => {
  const servicesContainer = document.querySelector("#services > div");
  const searchForm = document.querySelector("#home form[role='search']");
  const searchInput = document.querySelector("#village-search");
  const header = document.querySelector("body > header");
  const footer = document.querySelector("footer#contact");

  // Define the service directory data used to build the information cards.
  const services = [
    { icon: "fa-map-location-dot", title: "Village Directory", description: "Village profiles for the eight Pathakota villages: names, population, households, contacts, facilities, roads, transport, drinking water, electricity and Panchayat information.", link: "#pathakota-villages", linkText: "View Pathakota villages" },
    { icon: "fa-file-lines", title: "Government Schemes", description: "Learn about public programmes, eligibility and applications.", link: "#services", linkText: "View schemes" },
    { icon: "fa-book-open-reader", title: "Education", description: "Find schools, learning resources and student support.", link: "#services", linkText: "Explore education" },
    { icon: "fa-heart-pulse", title: "Healthcare", description: "Locate health facilities and community care services.", link: "#emergency", linkText: "Find healthcare" },
    { icon: "fa-seedling", title: "Agriculture", description: "Access farming information, support and seasonal resources.", link: "#services", linkText: "Explore agriculture" },
    { icon: "fa-briefcase", title: "Employment", description: "Discover skill development, livelihoods and job resources.", link: "#services", linkText: "Find opportunities" },
    { icon: "fa-people-group", title: "Tribal Welfare", description: "Connect with community welfare services and support.", link: "#services", linkText: "View welfare services" },
    { icon: "fa-camera", title: "Tourism", description: "Discover local culture, heritage and places to visit.", link: "#news", linkText: "Explore tourism" }
  ];

  // Show a short accessible status message for searches and form submissions.
  function showMessage(message, type = "info") {
    let notice = document.querySelector("#agency-notice");
    if (!notice) {
      notice = document.createElement("p");
      notice.id = "agency-notice";
      notice.setAttribute("role", "status");
      notice.setAttribute("aria-live", "polite");
      document.body.append(notice);
    }
    notice.textContent = message;
    notice.dataset.type = type;
    notice.hidden = false;
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => { notice.hidden = true; }, 5000);
  }

  // Add small responsive styles and keyboard focus styles for controls created here.
  function addInteractionStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .menu-toggle, .account-button { border: 0; border-radius: 9px; padding: .65rem .9rem; background: #267052; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
      .menu-toggle { display: none; }
      #agency-notice { position: fixed; z-index: 20; right: 1rem; bottom: 1rem; max-width: min(90vw, 420px); margin: 0; padding: .9rem 1.2rem; border-radius: 10px; background: #173f35; color: white; box-shadow: 0 8px 28px #0003; }
      #agency-notice[data-type="error"] { background: #8c2d24; }
      #agency-notice[hidden] { display: none; }
      .account-dialog { width: min(92vw, 480px); max-height: 90vh; overflow: auto; border: 0; border-radius: 18px; padding: 1.5rem; color: #22332d; box-shadow: 0 20px 70px #0005; }
      .account-dialog::backdrop { background: #10251fcc; }
      .account-dialog h2 { margin-top: 0; color: #173f35; }
      .account-dialog form { display: grid; gap: .8rem; }
      .account-dialog label { display: grid; gap: .25rem; font-weight: 650; }
      .account-dialog input, #agency-contact-form input, #agency-contact-form textarea { width: 100%; padding: .7rem; border: 1px solid #bbc9bf; border-radius: 8px; font: inherit; }
      .account-dialog menu { display: flex; flex-wrap: wrap; gap: .6rem; margin: 1rem 0 0; padding: 0; }
      .account-dialog menu button, #agency-contact-form button { border: 0; border-radius: 8px; padding: .7rem 1rem; background: #267052; color: white; font: inherit; font-weight: 700; cursor: pointer; }
      .account-dialog menu button[data-secondary] { background: #e8eee7; color: #173f35; }
      #agency-contact-form { display: grid; gap: .7rem; max-width: 620px; }
      #agency-contact-form label { display: grid; gap: .25rem; }
      #services article[hidden] { display: none; }
      @media (max-width: 760px) {
        .menu-toggle { display: inline-flex; align-items: center; gap: .5rem; }
        body > header { width: 100%; }
        body > header nav[data-mobile-menu="true"] { display: none; width: 100%; }
        body > header nav[data-mobile-menu="true"].is-open { display: block; }
        body > header nav[data-mobile-menu="true"] ul { flex-direction: column; align-items: flex-start; }
      }
    `;
    document.head.append(style);
  }

  // Rebuild service cards from the data array so their content is easy to update.
  function createServiceCards() {
    if (!servicesContainer) return;
    servicesContainer.replaceChildren();
    services.forEach((service, index) => {
      const card = document.createElement("article");
      card.dataset.searchText = `${service.title} ${service.description}`.toLowerCase();
      if (index === 0) card.id = "village-directory";

      const icon = document.createElement("i");
      icon.className = `fa-solid ${service.icon}`;
      icon.setAttribute("aria-hidden", "true");
      const title = document.createElement("h3");
      title.textContent = service.title;
      const description = document.createElement("p");
      description.textContent = service.description;
      const link = document.createElement("a");
      link.href = service.link;
      link.append(document.createTextNode(`${service.linkText} `));
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "→";
      link.append(arrow);

      card.append(icon, title, description, link);
      servicesContainer.append(card);
    });
  }

  // Add a mobile menu button and keep its expanded state accessible to assistive tech.
  function setupMobileNavigation() {
    if (!header) return;
    const nav = header.querySelector("nav[aria-label='Main navigation']");
    if (!nav) return;
    nav.dataset.mobileMenu = "true";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "menu-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "main-navigation");
    toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i><span>Menu</span>';
    nav.id = "main-navigation";
    nav.before(toggle);

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Filter service cards and village rows using the existing village search field.
  function setupSearch() {
    if (!searchForm || !searchInput) return;
    const searchStatus = document.createElement("p");
    searchStatus.id = "search-status";
    searchStatus.setAttribute("role", "status");
    searchStatus.setAttribute("aria-live", "polite");
    searchForm.after(searchStatus);

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = searchInput.value.trim().toLocaleLowerCase();
      const cards = [...document.querySelectorAll("#services article")];
      const rows = [...document.querySelectorAll("#pathakota-villages tbody tr")];
      if (!query) {
        cards.forEach((card) => { card.hidden = false; });
        rows.forEach((row) => { row.hidden = false; });
        searchStatus.textContent = "Showing all services and villages.";
        return;
      }

      let matches = 0;
      cards.forEach((card) => {
        const match = (card.dataset.searchText || card.textContent).toLocaleLowerCase().includes(query);
        card.hidden = !match;
        if (match) matches += 1;
      });
      rows.forEach((row) => {
        const match = row.textContent.toLocaleLowerCase().includes(query);
        row.hidden = !match;
        if (match) matches += 1;
      });
      searchStatus.textContent = matches
        ? `${matches} result${matches === 1 ? "" : "s"} found for “${searchInput.value.trim()}”.`
        : `No village or service found for “${searchInput.value.trim()}”.`;
      (matches ? document.querySelector("#services") : searchInput).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Add a contact form to the existing footer and validate it in the browser.
  function setupContactForm() {
    if (!footer) return;
    const section = document.createElement("section");
    section.setAttribute("aria-labelledby", "contact-form-title");
    section.innerHTML = `
      <h2 id="contact-form-title">Send a Message</h2>
      <form id="agency-contact-form">
        <label for="contact-name">Name</label>
        <input id="contact-name" name="name" type="text" autocomplete="name" required minlength="2">
        <label for="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" autocomplete="email" required>
        <label for="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows="4" required minlength="10"></textarea>
        <button type="submit">Send message</button>
      </form>`;
    footer.append(section);
    const form = section.querySelector("form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      form.reset();
      showMessage("Thank you. Your message is ready, but this demo does not send it to a server.", "success");
    });
  }

  // Open a dialog with either a registration or demo login form.
  function setupAccountForms() {
    if (!header) return;
    const accountButton = document.createElement("button");
    accountButton.type = "button";
    accountButton.className = "account-button";
    accountButton.textContent = "Login / Register";
    header.append(accountButton);

    const dialog = document.createElement("dialog");
    dialog.className = "account-dialog";
    dialog.setAttribute("aria-labelledby", "account-dialog-title");
    document.body.append(dialog);

    // Safely read the profile record if LocalStorage is available in this browser.
    function readUser() {
      try { return JSON.parse(localStorage.getItem("agencyConnectUser") || "null"); }
      catch { return null; }
    }

    // Render a selected account form and attach its validation and submit behavior.
    function renderForm(mode = "login") {
      const registration = mode === "register";
      dialog.innerHTML = `
        <h2 id="account-dialog-title">${registration ? "Create an account" : "Demo login"}</h2>
        <p>This is a front-end demonstration. It does not create a secure account or connect to an authentication service.</p>
        <form id="account-form">
          ${registration ? '<label for="account-name">Name<input id="account-name" name="name" autocomplete="name" required minlength="2"></label>' : ""}
          <label for="account-email">Email<input id="account-email" name="email" type="email" autocomplete="email" required></label>
          <label for="account-password">Password<input id="account-password" name="password" type="password" autocomplete="${registration ? "new-password" : "current-password"}" required minlength="8"></label>
          <menu>
            <button type="submit">${registration ? "Register" : "Login"}</button>
            <button type="button" data-secondary>${registration ? "I already have an account" : "Create account"}</button>
            <button type="button" data-close>Close</button>
          </menu>
        </form>`;

      const form = dialog.querySelector("#account-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const formData = new FormData(form);
        const email = String(formData.get("email")).trim();
        if (registration) {
          const user = { name: String(formData.get("name")).trim(), email };
          try { localStorage.setItem("agencyConnectUser", JSON.stringify(user)); }
          catch { showMessage("LocalStorage is unavailable. Your profile was not saved.", "error"); return; }
          dialog.close();
          showMessage(`Registration details saved for ${user.name}. Passwords are never stored by this demo.`, "success");
        } else {
          const user = readUser();
          if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
            showMessage("No saved profile matches that email. Register first, or use the same email.", "error");
            return;
          }
          dialog.close();
          showMessage(`Welcome back, ${user.name}. This demo checks the saved email only; it does not authenticate passwords.`, "success");
        }
      });

      dialog.querySelector("[data-secondary]").addEventListener("click", () => renderForm(registration ? "login" : "register"));
      dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
    }

    accountButton.addEventListener("click", () => {
      renderForm("login");
      dialog.showModal();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  // Smoothly scroll internal links and provide visible feedback for action buttons.
  function setupPageInteractions() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (link) {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", link.getAttribute("href"));
        }
      }
      const button = event.target.closest("button");
      if (button && !button.closest("form") && !button.matches(".menu-toggle, .account-button, [data-close], [data-secondary]")) {
        button.setAttribute("aria-pressed", button.getAttribute("aria-pressed") !== "true" ? "true" : "false");
      }
    });
  }

  // Start each feature after the page structure and service data are available.
  addInteractionStyles();
  createServiceCards();
  setupMobileNavigation();
  setupSearch();
  setupContactForm();
  setupAccountForms();
  setupPageInteractions();
});
