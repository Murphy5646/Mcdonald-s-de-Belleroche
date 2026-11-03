/* ===== CONFIGURATION CENTRALE : tout ce qui est modifiable est ici ===== */
window.SITE = {
  name: "McDonald's Belleroche",
  disclaimer: "Projet indépendant, non affilié à McDonald's Corporation. Les commandes ne sont transmises à aucun restaurant.",
  // API de candidature existante. VERIFIER le contrat réel (champs, format) quand le backend sera transmis.
  api: {
    url: "https://mcdonalds-belle-roche.wispbyte.app/candidature",
    format: "multipart",          // "multipart" (fichiers) ou "json"
    requireJson: true,            // succès affiché seulement si réponse OK + JSON valide
    timeoutMs: 20000,
    fieldMap: { prenom:"prenom", nom:"nom", email:"email", tel:"telephone", poste:"poste",
                dispo:"disponibilites", experience:"experience", motivation:"motivation",
                cv:"cv", lettre:"lettre_motivation" }   // A ALIGNER sur le backend
  },
  // Renseigner uniquement des informations vérifiées. null = affiché "À renseigner".
  restaurant: { address:null, phone:null, hours:null, services:[], mapEmbedUrl:null },
  // Prix = valeurs de DEMONSTRATION à remplacer.
  products: [
    { id:"burger", name:"Burger simple", cat:"Burgers", price:2.90, img:"assets/img/products/burger.webp",
      desc:"Steak grillé, fromage fondu, cornichons et oignons dans un pain moelleux.", detail:"Le classique, simple et efficace." },
    { id:"frites", name:"Frites", cat:"Accompagnements", price:2.50, img:"assets/img/products/frites.webp",
      desc:"Dorées, croustillantes dehors, fondantes dedans, salées juste ce qu'il faut.", detail:"Servies chaudes, à partager ou pas." },
    { id:"coca", name:"Coca-Cola", cat:"Boissons froides", price:2.40, img:"assets/img/products/coca-cola.webp",
      desc:"Le goût du Coca-Cola, bien frais, avec des glaçons.", detail:"Boisson gazeuse." },
    { id:"icetea", name:"Ice Tea", cat:"Boissons froides", price:2.40, img:"assets/img/products/ice-tea.webp",
      desc:"Thé glacé pêche, léger et désaltérant.", detail:"Boisson rafraîchissante." },
    { id:"cafe", name:"Café", cat:"Boissons chaudes", price:1.60, img:"assets/img/products/cafe.webp",
      desc:"Un expresso intense, préparé à la commande.", detail:"Boisson chaude." },
    { id:"cafelait", name:"Café au lait", cat:"Boissons chaudes", price:2.20, img:"assets/img/products/cafe-au-lait.webp",
      desc:"Café doux et lait chaud, pour une pause tout en rondeur.", detail:"Boisson chaude." },
    { id:"laitchoco", name:"Lait au chocolat", cat:"Boissons chaudes", price:2.20, img:"assets/img/products/lait-chocolat.webp",
      desc:"Lait onctueux et chocolat, servi chaud ou frais.", detail:"Boisson gourmande." }
  ]
};
