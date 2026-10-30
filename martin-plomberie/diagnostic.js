// Module « diagnostic » : la pièce → la panne → un verdict clair + un message WhatsApp déjà rédigé.
(() => {
  const data = JSON.parse(document.getElementById("diag-data").textContent);
  const $ = (s) => document.querySelector(s);
  const boxPieces = $("[data-pieces]"), boxPannes = $("[data-pannes]");
  const etapePannes = $("[data-etape-pannes]"), resultat = $("[data-resultat]"), wa = $("[data-wa]");
  const baseWa = wa.href;

  const bouton = (texte, surClic) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = texte;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      surClic();
    });
    return b;
  };

  data.pieces.forEach((piece) => boxPieces.append(bouton(piece.nom, () => {
    boxPannes.replaceChildren(...piece.pannes.map((panne) => bouton(panne.nom, () => {
      $("[data-verdict]").textContent = panne.urgence ? data.verdicts.urgence : data.verdicts.planifier;
      const message = `Bonjour, ${piece.nom.toLowerCase()} : ${panne.nom.toLowerCase()}. ${panne.urgence ? "C'est urgent." : "Je voudrais un rendez-vous."}`;
      wa.href = `${baseWa}?text=${encodeURIComponent(message)}`;
      resultat.hidden = false;
    })));
    etapePannes.hidden = false;
    resultat.hidden = true;
  })));
})();
