"use strict";

// ======================================
// CONFIGURATION
// ======================================
const RECRUITMENT_API_URL =
  "https://mcdonalds-belle-roche.wispbyte.app/candidature";

const REQUEST_TIMEOUT_MS = 20000;

const FIELDS = [
  "prenom",
  "nom",
  "email",
  "poste",
  "disponibilites",
  "motivation",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_COLORS = {
  info: "#333",
  success: "#27633b",
  error: "#a33",
};

// ======================================
// INITIALISATION
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recruitmentForm");
  const result = document.getElementById("recruitmentResult");

  if (!form || !result) {
    console.error("Erreur : formulaire ou zone de résultat introuvable.");
    return;
  }

  const submitButton = form.querySelector(
    'button[type="submit"], input[type="submit"]'
  );

  if (!submitButton) {
    console.error("Erreur : bouton d'envoi introuvable.");
    return;
  }

  result.setAttribute("aria-live", "polite");

  // ======================================
  // OUTILS
  // ======================================
  const isInput = submitButton.tagName === "INPUT";
  const defaultLabel = isInput ? submitButton.value : submitButton.textContent;

  const setButtonLabel = (text) => {
    if (isInput) submitButton.value = text;
    else submitButton.textContent = text;
  };

  const setStatus = (message, type = "info") => {
    result.textContent = message;
    result.dataset.status = type;
    result.style.color = STATUS_COLORS[type] || STATUS_COLORS.info;
  };

  const setLoading = (loading) => {
    submitButton.disabled = loading;
    setButtonLabel(loading ? "Envoi en cours..." : defaultLabel);
  };

  const readCandidature = () => {
    const data = new FormData(form);
    return Object.fromEntries(
      FIELDS.map((key) => [key, String(data.get(key) || "").trim()])
    );
  };

  const validate = (candidature) => {
    if (FIELDS.some((key) => !candidature[key])) {
      return "Merci de remplir tous les champs obligatoires.";
    }
    if (!EMAIL_REGEX.test(candidature.email)) {
      return "Merci de renseigner une adresse email valide.";
    }
    return null;
  };

  const friendlyError = (error) => {
    if (error.name === "AbortError") {
      return "Le serveur met trop de temps à répondre. Réessayez dans un instant.";
    }
    if (error instanceof TypeError) {
      return "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.";
    }
    return error.userMessage || "Une erreur est survenue. Réessayez plus tard.";
  };

  // ======================================
  // ENVOI DU FORMULAIRE
  // ======================================
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitButton.disabled) return;
    if (!form.reportValidity()) return;

    const candidature = readCandidature();

    const validationError = validate(candidature);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setLoading(true);
    setStatus("Transmission de votre candidature...", "info");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(RECRUITMENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidature),
        signal: controller.signal,
      });

      const answer = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(answer.error || `Erreur HTTP ${response.status}`);
        error.userMessage =
          response.status >= 500 && response.status !== 503
            ? "Le serveur a rencontré un problème. Réessayez plus tard."
            : answer.error || "Votre candidature n'a pas pu être envoyée.";
        throw error;
      }

      if (answer.success === false) {
        const error = new Error(answer.message || "Candidature non confirmée.");
        error.userMessage =
          answer.message || "La candidature n'a pas été confirmée.";
        throw error;
      }

      form.reset();
      setStatus("Votre candidature a été envoyée avec succès !", "success");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la candidature :", error);
      setStatus(friendlyError(error), "error");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  });
});
