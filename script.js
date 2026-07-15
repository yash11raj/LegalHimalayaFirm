/**
 * =========================================================
 * Legal Himalaya Firm — Premium Site Script
 * Modern ES6+, Performance Optimized, Accessible
 * =========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // Check user preference for reduced motion
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Preloader Management
   * Hides the preloader gracefully once the window has fully loaded.
   */
  const initPreloader = () => {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const hidePreloader = () => preloader.classList.add("is-hidden");

    if (document.readyState === "complete") {
      setTimeout(hidePreloader, 150);
    } else {
      window.addEventListener("load", () => setTimeout(hidePreloader, 150));
      // Safety fallback to ensure the site is accessible even if an asset hangs
      setTimeout(hidePreloader, 3000);
    }
  };

  /**
   * Navigation & Mobile Menu
   * Handles sticky header shadow, mobile menu toggling, focus trap, and closing mechanisms.
   * Focus trap confines keyboard nav to open menu items.
   * Escape closes menu and returns focus to the toggle button.
   */
  const initNav = () => {
    const navbar = document.getElementById("navbar");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");

    // Sticky Navigation Shadow
    if (navbar) {
      const handleScroll = () => {
        navbar.classList.toggle("is-scrolled", window.scrollY > 10);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Init state
    }

    // Mobile Menu Toggle with Focus Trap
    if (toggle && links) {
      let trapFn = null;

      const getFocusable = () => [
        ...links.querySelectorAll("a, button, [tabindex]:not([tabindex='-1'])"),
      ];

      const setupTrap = () => {
        trapFn = (e) => {
          if (e.key !== "Tab") return;
          const items = getFocusable();
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        };
        document.addEventListener("keydown", trapFn);
      };

      const clearTrap = () => {
        if (trapFn) {
          document.removeEventListener("keydown", trapFn);
          trapFn = null;
        }
      };

      const toggleMenu = (forceClose = false, returnFocusToToggle = false) => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        const newState = forceClose ? false : !isOpen;

        toggle.setAttribute("aria-expanded", String(newState));
        links.classList.toggle("is-open", newState);

        if (newState) {
          // Opening: establish focus trap and move focus into menu
          setupTrap();
          const first = getFocusable()[0];
          if (first) first.focus();
        } else {
          // Closing: remove trap
          clearTrap();
          // Return focus to the toggle when closed via keyboard (Escape)
          if (returnFocusToToggle) toggle.focus();
        }
      };

      toggle.addEventListener("click", () => toggleMenu());

      // Close menu when a navigation link is clicked (user navigating — don't hijack focus)
      links.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => toggleMenu(true, false));
      });

      // Close menu on Escape and return focus to the toggle button
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
          toggleMenu(true, true);
        }
      });

      // Close menu when clicking outside of it
      document.addEventListener("click", (e) => {
        if (
          links.classList.contains("is-open") &&
          !links.contains(e.target) &&
          !toggle.contains(e.target)
        ) {
          toggleMenu(true, false);
        }
      });
    }
  };

  /**
   * Active Page Highlighting
   * Marks the nav link matching the current page's filename as active.
   * Each nav item is now a link to its own page rather than a same-page anchor.
   */
  const initActiveNav = () => {
    const navAnchors = document.querySelectorAll("a[data-nav]");
    if (!navAnchors.length) return;

    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    navAnchors.forEach((a) => {
      const linkPage = a.getAttribute("href").split("/").pop();
      const isActive = linkPage === currentPage;
      a.classList.toggle("is-active", isActive);
      if (isActive) {
        a.setAttribute("aria-current", "page"); // "page" is the correct token for nav links
      } else {
        a.removeAttribute("aria-current");
      }
    });
  };

  /**
   * Scroll Reveal Animations
   * Fades in elements sequentially as they enter the viewport.
   */
  const initScrollReveal = () => {
    const items = document.querySelectorAll("[data-animate]");
    if (!items.length) return;

    // Apply staggered delays if defined in HTML
    items.forEach((el) => {
      const delay = el.dataset.animateDelay;
      if (delay) el.style.setProperty("--delay", delay);
    });

    // Instantly reveal elements if user prefers reduced motion or if IntersectionObserver is unsupported
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    items.forEach((el) => observer.observe(el));
  };

  /**
   * Animated Counters
   * Animates statistical numbers counting up when scrolled into view.
   */
  const initCounters = () => {
    const counters = document.querySelectorAll(".stat-number");
    if (!counters.length) return;

    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      const duration = 1500; // Animation duration in ms
      let start = null;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);

        // Ease-out quintic equation for a premium slowing effect
        const eased = 1 - Math.pow(1 - progress, 5);
        const value = Math.round(target * eased);

        el.textContent = value + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    counters.forEach((el) => observer.observe(el));
  };

  /**
   * Back to Top Button
   * Shows/hides a floating button to scroll smoothly back to the page start.
   */
  const initBackToTop = () => {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    const handleScroll = () => {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initialize state

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  };

  /**
   * FAQ Accordion
   * Ensures only one details/summary element is open at a time.
   */
  const initFaq = () => {
    const detailsElements = document.querySelectorAll(".faq-list details");

    detailsElements.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) {
          detailsElements.forEach((other) => {
            if (other !== item) other.open = false;
          });
        }
      });
    });
  };

  /**
   * Contact Form Validation & Mailto Generation
   * Handles client-side validation, error messaging, and formatting the email draft.
   */
  const initContactForm = () => {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const status = document.getElementById("formStatus");
    const phonePattern = /^[6-9]\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const fields = {
      name: {
        input: document.getElementById("cf-name"),
        error: document.getElementById("err-name"),
      },
      phone: {
        input: document.getElementById("cf-phone"),
        error: document.getElementById("err-phone"),
      },
      email: {
        input: document.getElementById("cf-email"),
        error: document.getElementById("err-email"),
      },
      service: {
        input: document.getElementById("cf-service"),
        error: document.getElementById("err-service"),
      },
      message: {
        input: document.getElementById("cf-message"),
        error: document.getElementById("err-message"),
      },
    };

    const setError = (key, message) => {
      const field = fields[key];
      if (!field || !field.input) return;

      const wrapper = field.input.closest(".field");
      field.error.textContent = message;

      if (message) {
        wrapper?.classList.add("has-error");
        field.input.setAttribute("aria-invalid", "true");
      } else {
        wrapper?.classList.remove("has-error");
        field.input.setAttribute("aria-invalid", "false");
      }
    };

    const validators = {
      name: () => {
        const val = fields.name.input.value.trim();
        if (!val) {
          setError("name", "Please provide your full name or corporate entity.");
          return false;
        }
        setError("name", "");
        return true;
      },
      phone: () => {
        const val = fields.phone.input.value.trim();
        if (!val) {
          setError("phone", "Please provide a contact number.");
          return false;
        }
        if (!phonePattern.test(val)) {
          setError("phone", "Please enter a valid 10-digit Indian phone number.");
          return false;
        }
        setError("phone", "");
        return true;
      },
      email: () => {
        const val = fields.email.input.value.trim();
        if (!val) {
          setError("email", "Please provide a professional email address.");
          return false;
        }
        if (!emailPattern.test(val)) {
          setError("email", "Please enter a valid email format.");
          return false;
        }
        setError("email", "");
        return true;
      },
      service: () => {
        const val = fields.service.input.value;
        if (!val) {
          setError("service", "Please select your primary area of interest.");
          return false;
        }
        setError("service", "");
        return true;
      },
      message: () => {
        const val = fields.message.input.value.trim();
        if (!val) {
          setError("message", "Please provide details regarding your inquiry.");
          return false;
        }
        setError("message", "");
        return true;
      },
    };

    const validateForm = () => {
      let isValid = true;
      Object.keys(validators).forEach((key) => {
        if (!validators[key]()) isValid = false;
      });
      return isValid;
    };

    // Form Submission — with fallback contact options
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validateForm()) {
        status.textContent =
          "Please correct the highlighted fields before transmitting.";
        status.className = "form-status is-error";
        return;
      }

      // Extract the human-readable text from the selected dropdown option
      const selectEl = fields.service.input;
      const serviceText = selectEl.options[selectEl.selectedIndex].text;

      // Construct Email Content
      const subject = `Confidential Inquiry: ${serviceText}`;
      const body = `Corporate / Personal Information:
---------------------------------
Name/Entity: ${fields.name.input.value.trim()}
Contact Number: ${fields.phone.input.value.trim()}
Email Address: ${fields.email.input.value.trim()}

Practice Area Required:
---------------------------------
${serviceText}

Detailed Inquiry:
---------------------------------
${fields.message.input.value.trim()}
`;

      const gmailLink = `https://mail.google.com/mail/?view=cm&to=legalhimalayafirm@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Trigger user's default email client
      window.open(gmailLink, '_blank');

      // Show success state with direct-call fallback in case the
      // new tab was blocked (browsers give no reliable signal when popups are blocked)
      status.innerHTML =
        "Gmail should now be open in a new tab with your message ready to send." +
        " If it didn’t open, call us directly:" +
        " <a href=\"tel:+918235342353\">+91 82353 42353</a>.";
      status.className = "form-status is-success";

      // Delay form reset slightly so user can still see their entries if needed
      setTimeout(() => form.reset(), 1200);
    });

    // Real-time validation on blur — only the field that was actually touched
    Object.keys(fields).forEach((key) => {
      const input = fields[key].input;
      if (input && validators[key]) {
        input.addEventListener("blur", () => validators[key]());
      }
    });
  };

  // Initialize all functions
  initPreloader();
  initNav();
  initActiveNav();
  initScrollReveal();
  initCounters();
  initBackToTop();
  initFaq();
  initContactForm();
});
