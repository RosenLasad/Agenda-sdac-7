(function(){
  "use strict";

  if(!window.AGENDA_TODAY_DATA) window.AGENDA_TODAY_DATA = { byDay: {} };
  if(!window.AGENDA_TODAY_DATA.byDay) window.AGENDA_TODAY_DATA.byDay = {};

  Object.assign(window.AGENDA_TODAY_DATA.byDay, {
    "06-01": {
        "person": {
            "name": "Gareth Edwards",
            "birthDate": "1975-06-01",
            "note": "Regista britannico diventato noto con Monsters e poi affermatosi nel grande cinema spettacolare con Godzilla e Rogue One; è interessante per il modo in cui unisce visione autoriale e scala industriale."
        },
        "history": {
            "title": "FILM - Superman II (Richard Lester)",
            "subtitle": "1981 · presentazione New York",
            "text": "Nel 1981 Superman II (Richard Lester) viene presentato al National Theater di New York: è un ottimo esempio di sequel che contribuisce a fissare l’immaginario del cinecomic prima dell’era moderna dei franchise."
        },
        "quote": {
            "author": "Callie Khouri",
            "text": "Ho scritto Thelma & Louise perché ero stanca di vedere donne al cinema che non prendevano mai in mano il proprio destino.",
            "note": ""
        },
        "heroSubline": "Il primo piano è l'unità di misura dell'anima al cinema"
    },
    "06-02": {
        "person": {
            "name": "Lotte Reiniger",
            "birthDate": "1899-06-02",
            "note": "Pioniera assoluta del cinema d’animazione, fondamentale per la storia delle silhouette animate; è un nome prezioso per ricordare che la regia cinematografica ha anche radici artigianali, poetiche e sperimentali."
        },
        "history": {
            "title": "FILM - Wonder Woman (Patty Jenkins)",
            "subtitle": "2017 · uscita USA",
            "text": "Nel 2017 Wonder Woman (Patty Jenkins) esce negli Stati Uniti: il film diventa un passaggio importante per il blockbuster supereroistico al femminile."
        },
        "quote": {
            "author": "Walt Disney",
            "text": "C'è più tesoro nei libri che in tutto il bottino dei pirati dell'Isola del Tesoro.",
            "note": ""
        },
        "heroSubline": "Se la posta in gioco non è la vita o la morte (anche metaforica), la scena è piatta"
    },
    "06-03": {
        "person": {
            "name": "Alain Resnais",
            "birthDate": "1922-06-03",
            "note": "Uno dei grandi maestri del cinema francese, autore raffinatissimo legato alla memoria, al tempo e alla complessità della narrazione; un protagonista perfetto per una giornata di cinema d’autore alto."
        },
        "history": {
            "title": "FILM - WarGames (John Badham)",
            "subtitle": "1983 · uscita USA",
            "text": "Nel 1983 esce WarGames (John Badham): film chiave per l’immaginario degli anni Ottanta, capace di portare nel cinema pop temi come hacking, informatica e paura nucleare."
        },
        "quote": {
            "author": "Pietro Scalia (Black Hawk Down)",
            "text": "Il montaggio non è solo tagliare pezzi di pellicola, è creare una nuova dimensione di spazio e tempo.",
            "note": ""
        },
        "heroSubline": "I soldi spesi per una buona sceneggiatura sono sempre i soldi meglio spesi"
    },
    "06-04": {
        "person": {
            "name": "Dani Kouyaté",
            "birthDate": "1961-06-04",
            "note": "Regista del Burkina Faso, figura importante del cinema africano contemporaneo; utile per dare spazio a una geografia del cinema più ampia e meno scontata."
        },
        "history": {
            "title": "FILM - Poltergeist (Tobe Hooper)",
            "subtitle": "1982 · uscita USA",
            "text": "Nel 1982 esce Poltergeist (Tobe Hooper): uno dei grandi horror popolari del decennio, sospeso tra intrattenimento, paura domestica e spettacolo soprannaturale."
        },
        "quote": {
            "author": "Vilmos Zsigmond",
            "text": "La luce deve sempre avere una direzione logica nella scena, altrimenti lo spettatore si sente confuso.",
            "note": ""
        },
        "heroSubline": "Recitare è reagire"
    },
    "06-05": {
        "person": {
            "name": "Tony Richardson",
            "birthDate": "1928-06-05",
            "note": "Regista inglese centrale nel British New Wave, autore di film fondamentali come Tom Jones e di un cinema energico, libero e modernissimo per il suo tempo."
        },
        "history": {
            "title": "FILM - The Truman Show (Peter Weir)",
            "subtitle": "1998 · uscita USA",
            "text": "Nel 1998 esce The Truman Show (Peter Weir): un film diventato sempre più attuale, perfetto per parlare di reality, sorveglianza, identità e confine tra vita e spettacolo."
        },
        "quote": {
            "author": "Max Steiner",
            "text": "Se c'è amore sullo schermo, ci deve essere una melodia d'amore in sottofondo.",
            "note": ""
        },
        "heroSubline": "Ogni movimento di macchina deve nascere da un movimento dell'attore"
    },
    "06-06": {
        "person": {
            "name": "Hirokazu Kore-eda",
            "birthDate": "1962-06-06",
            "note": "Uno dei più grandi registi giapponesi contemporanei, capace di raccontare famiglia, infanzia e fragilità con una delicatezza narrativa straordinaria."
        },
        "history": {
            "title": "FILM - Omen - Il presagio (John Moore)",
            "subtitle": "2006 · uscita USA",
            "text": "Nel 2006 esce Omen - Il presagio (John Moore), remake lanciato apposta il 6/6/06 per sfruttare il simbolismo del 666: una curiosità perfetta da agenda."
        },
        "quote": {
            "author": "Béla Tarr",
            "text": "Il cinema non è una storia. Il cinema riguarda l'essere umano, la dignità, il tempo e lo spazio.",
            "note": ""
        },
        "heroSubline": "Rispetta la struttura classica non come una gabbia, ma come una mappa"
    },
    "06-07": {
        "person": {
            "name": "Kim Hyun-seok",
            "birthDate": "1972-06-07",
            "note": "Regista e sceneggiatore sudcoreano noto per il suo cinema elegante e narrativamente molto solido; una buona scelta per rappresentare la ricchezza del cinema coreano oltre i nomi più ovvi."
        },
        "history": {
            "title": "FILM - The Goonies (Richard Donner)",
            "subtitle": "1985 · uscita USA",
            "text": "Nel 1985 esce The Goonies (Richard Donner): avventura generazionale diventata un cult, simbolo del cinema per ragazzi degli anni Ottanta."
        },
        "quote": {
            "author": "Paul Schrader",
            "text": "La sceneggiatura è un invito a fare un film. Non è letteratura.",
            "note": ""
        },
        "heroSubline": "Non iniziare mai a girare se non hai in cassa i soldi per finire il film"
    },
    "06-08": {
        "person": {
            "name": "Jean-Pierre Bekolo",
            "birthDate": "1966-06-08",
            "note": "Regista camerunese originale e combattivo, capace di unire invenzione formale, riflessione politica e identità africana contemporanea."
        },
        "history": {
            "title": "FILM - Ghostbusters (Ivan Reitman)",
            "subtitle": "1984 · uscita USA",
            "text": "Nel 1984 esce Ghostbusters (Ivan Reitman): un caso raro di film capace di fondere commedia, fantastico e brand pop in modo immediatamente iconico."
        },
        "quote": {
            "author": "Darryl F. Zanuck",
            "text": "La televisione non sarà in grado di trattenere nessun mercato dopo i primi sei mesi. La gente si stancherà presto di guardare una scatola di compensato ogni sera.",
            "note": ""
        },
        "heroSubline": "Il miglior attore è quello che sa ascoltare"
    },
    "06-09": {
        "person": {
            "name": "David Koepp",
            "birthDate": "1963-06-09",
            "note": "Sceneggiatore celeberrimo e anche regista, importante per capire il rapporto tra scrittura hollywoodiana, costruzione del racconto e messa in scena."
        },
        "history": {
            "title": "FILM - Cars (John Lasseter)",
            "subtitle": "2006 · uscita USA",
            "text": "Nel 2006 esce Cars (John Lasseter): uno dei passaggi importanti della Pixar dei Duemila, e anche l’ultimo film prodotto dallo studio prima dell’integrazione completa con Disney."
        },
        "quote": {
            "author": "Margaret Sixel (Mad Max: Fury Road)",
            "text": "Montare un film d'azione significa orchestrare il caos e renderlo perfettamente leggibile.",
            "note": ""
        },
        "heroSubline": "La profondità di campo non serve a far vedere tutto, ma a far capire dove guardare"
    },
    "06-10": {
        "person": {
            "name": "Jeremy Saulnier",
            "birthDate": "1976-06-10",
            "note": "Regista americano apprezzato per thriller tesi e secchi come Blue Ruin e Green Room; perfetto per parlare di regia fisica, ritmo e tensione."
        },
        "history": {
            "title": "FILM - Speed (Jan de Bont)",
            "subtitle": "1994 · uscita USA",
            "text": "Nel 1994 esce Speed (Jan de Bont): thriller d’azione ad altissima tensione che lancia definitivamente il duo Keanu Reeves–Sandra Bullock e segna il cinema action degli anni Novanta."
        },
        "quote": {
            "author": "Robert Richardson",
            "text": "Lavorare con la luce significa controllare il caos. È un continuo gioco di riflessi e contrasti.",
            "note": ""
        },
        "heroSubline": "Un buon finale deve essere inevitabile, ma del tutto inaspettato"
    },
    "06-11": {
        "person": {
            "name": "Paul Lynch",
            "birthDate": "1946-06-11",
            "note": "Regista anglo-canadese di cinema e televisione, ricordato soprattutto per Prom Night; buon nome per dare spazio anche al cinema di genere."
        },
        "history": {
            "title": "FILM - E.T. l’extra-terrestre (Steven Spielberg)",
            "subtitle": "1982 · uscita USA",
            "text": "Nel 1982 esce E.T. l’extra-terrestre (Steven Spielberg) negli Stati Uniti: uno dei momenti più forti del cinema popolare di Spielberg e dell’immaginario fantastico moderno."
        },
        "quote": {
            "author": "Danny Elfman",
            "text": "La musica in un film deve riflettere la follia dei personaggi e del regista.",
            "note": ""
        },
        "heroSubline": "Il casting è l'80% del successo commerciale di un film"
    },
    "06-12": {
        "person": {
            "name": "Takashi Yamazaki",
            "birthDate": "1964-06-12",
            "note": "Regista giapponese molto importante nel cinema popolare contemporaneo, capace di fondere spettacolo, effetti visivi e sensibilità narrativa."
        },
        "history": {
            "title": "FILM - I predatori dell’Arca perduta (Steven Spielberg)",
            "subtitle": "1981 · uscita USA",
            "text": "Nel 1981 esce I predatori dell’Arca perduta (Steven Spielberg): il primo Indiana Jones diventa un modello quasi definitivo di cinema d’avventura classico e spettacolare."
        },
        "quote": {
            "author": "Wong Kar-wai",
            "text": "Il cinema è catturare un momento che non tornerà mai più.",
            "note": ""
        },
        "heroSubline": "La battuta non nasce nella tua gola, nasce negli occhi del tuo partner di scena"
    },
    "06-13": {
        "person": {
            "name": "Ron Mann",
            "birthDate": "1958-06-13",
            "note": "Documentarista canadese di grande personalità, autore di film legati a musica, cultura e controcultura; interessante per valorizzare il documentario come forma piena di cinema."
        },
        "history": {
            "title": "FILM - Toy Story 3 (Lee Unkrich)",
            "subtitle": "2010 · presentazione USA",
            "text": "Nel 2010 Toy Story 3 (Lee Unkrich) viene presentato negli Stati Uniti dopo la première di Taormina: è un buon giorno per ricordare uno dei capitoli più amati dell’animazione contemporanea."
        },
        "quote": {
            "author": "Ruth Prawer Jhabvala",
            "text": "Lavorare su un adattamento significa essere fedeli allo spirito dell'opera, non necessariamente alle sue parole.",
            "note": ""
        },
        "heroSubline": "Se non sai dove mettere la macchina da presa, mettila all'altezza degli occhi del personaggio"
    },
    "06-14": {
        "person": {
            "name": "E. Elias Merhige",
            "birthDate": "1964-06-14",
            "note": "Regista americano di culto, autore di opere visionarie e inquietanti come Begotten e Shadow of the Vampire; nome forte per una giornata più radicale e sperimentale."
        },
        "history": {
            "title": "FILM - Man of Steel (Zack Snyder)",
            "subtitle": "2013 · uscita USA",
            "text": "Nel 2013 esce Man of Steel (Zack Snyder): un reboot importante perché inaugura il nuovo corso cinematografico DC con un tono più cupo e solenne."
        },
        "quote": {
            "author": "Robert Evans",
            "text": "In ogni progetto ci sono 100 persone che possono dire no e solo una persona che può dire sì. Devi portare il materiale a quella persona.",
            "note": ""
        },
        "heroSubline": "Il dialogo è l'ultima risorsa dello sceneggiatore"
    },
    "06-15": {
        "person": {
            "name": "John Dahl",
            "birthDate": "1956-06-15",
            "note": "Regista americano noto per il neo-noir degli anni Novanta, capace di trasformare il thriller in un terreno di stile, ambiguità e tensione morale."
        },
        "history": {
            "title": "FILM - Il Re Leone (Roger Allers e Rob Minkoff)",
            "subtitle": "1994 · release limitata USA",
            "text": "Nel 1994 Il Re Leone (Roger Allers e Rob Minkoff) debutta in release limitata negli Stati Uniti: è l’inizio della corsa di uno dei film simbolo del Rinascimento Disney."
        },
        "quote": {
            "author": "Dylan Tichenor (Magnolia)",
            "text": "Se tagli un frame troppo presto o troppo tardi, l'intera magia dell'inquadratura può svanire.",
            "note": ""
        },
        "heroSubline": "Il produttore ideale deve essere il primo psicologo del regista e l'ultimo contabile del film"
    },
    "06-16": {
        "person": {
            "name": "Sabyn Mayfield",
            "birthDate": "1981-06-16",
            "note": "Regista indipendente americano legato a videoclip, corti e produzioni personali; una scelta meno canonica ma coerente con l’idea di valorizzare registi puri anche fuori dal circuito più celebre."
        },
        "history": {
            "title": "FILM - Psycho (Alfred Hitchcock)",
            "subtitle": "1960 · uscita New York",
            "text": "Nel 1960 Psycho (Alfred Hitchcock) esce a New York: Hitchcock impone la celebre regola del “no late admission”, trasformando anche la visione in sala in un evento."
        },
        "quote": {
            "author": "Janusz Kamiński",
            "text": "La luce deve essere drammatica. Deve raccontare lo stato d'animo della scena prima ancora delle parole.",
            "note": ""
        },
        "heroSubline": "Non aspettare il tuo turno per parlare, ascolta come se fosse la prima volta che senti quelle parole"
    },
    "06-17": {
        "person": {
            "name": "Ken Loach",
            "birthDate": "1936-06-17",
            "note": "Tra i più importanti registi britannici di sempre, maestro del realismo sociale e del cinema civile; uno dei nomi più forti dell’intero mese."
        },
        "history": {
            "title": "FILM - Minority Report (Steven Spielberg)",
            "subtitle": "2002 · anteprima New York",
            "text": "Nel 2002 Minority Report (Steven Spielberg) viene presentato in anteprima al Ziegfeld Theatre: Spielberg porta nel mainstream una fantascienza elegante, inquieta e filosofica."
        },
        "quote": {
            "author": "Ludwig Göransson",
            "text": "La musica da film oggi non ha confini: può essere un'orchestra classica, un sintetizzatore o un suono industriale.",
            "note": ""
        },
        "heroSubline": "Il film si gira sul set, ma nasce davvero nella solitudine della sala di montaggio"
    },
    "06-18": {
        "person": {
            "name": "Rick Famuyiwa",
            "birthDate": "1973-06-18",
            "note": "Regista americano capace di coniugare energia pop, identità culturale e racconto generazionale; un nome utile per rappresentare il cinema americano contemporaneo con personalità."
        },
        "history": {
            "title": "FILM - Toy Story 3 (Lee Unkrich)",
            "subtitle": "2010 · uscita USA",
            "text": "Nel 2010 Toy Story 3 (Lee Unkrich) esce negli Stati Uniti: sarà il primo film d’animazione a superare il miliardo di dollari al box office mondiale."
        },
        "quote": {
            "author": "Buster Keaton",
            "text": "Il silenzio è d'oro, ma le immagini valgono più di mille parole.",
            "note": ""
        },
        "heroSubline": "Nessuno dice mai esattamente quello che pensa"
    },
    "06-19": {
        "person": {
            "name": "Sean Anders",
            "birthDate": "1969-06-19",
            "note": "Regista e sceneggiatore americano legato alla commedia, capace di lavorare nel cinema mainstream senza rinunciare a una certa cura narrativa e umana."
        },
        "history": {
            "title": "Apre il primo Nickelodeon",
            "subtitle": "1905 · sala cinematografica",
            "text": "Nel 1905 apre a Pittsburgh il primo Nickelodeon: non era il primo spazio a proiettare film, ma fu il modello della sala popolare dedicata continuativamente al cinema."
        },
        "quote": {
            "author": "Aaron Sorkin",
            "text": "I dialoghi nei miei film non sono il modo in cui le persone parlano davvero. Sono il modo in cui le persone vorrebbero saper parlare.",
            "note": ""
        },
        "heroSubline": "I registi sono come i bambini prodigio: hanno bisogno di essere amati, ma anche di regole ferree"
    },
    "06-20": {
        "person": {
            "name": "Robert Rodriguez",
            "birthDate": "1968-06-20",
            "note": "Regista americano tra i più riconoscibili nel cinema indipendente e di genere, simbolo di libertà produttiva, inventiva tecnica e stile personale."
        },
        "history": {
            "title": "FILM - Lo squalo (Steven Spielberg)",
            "subtitle": "1975 · uscita USA",
            "text": "Nel 1975 esce Lo squalo (Steven Spielberg): per molti è il vero inizio dell’idea moderna di blockbuster estivo, tra grande distribuzione, marketing aggressivo e fenomeno collettivo."
        },
        "quote": {
            "author": "Robert Evans",
            "text": "Ci sono tre versioni di ogni storia: la tua, la mia e la verità.",
            "note": ""
        },
        "heroSubline": "Rubare la scena è un'arte che richiede rispetto per l'altro"
    },
    "06-21": {
        "person": {
            "name": "Lana Wachowski",
            "birthDate": "1965-06-21",
            "note": "Una delle figure decisive dell’immaginario contemporaneo, co-autrice di Matrix e di una regia capace di fondere filosofia, azione e visione futuristica."
        },
        "history": {
            "title": "FILM - Minority Report (Steven Spielberg)",
            "subtitle": "2002 · uscita USA",
            "text": "Nel 2002 Minority Report (Steven Spielberg) arriva nelle sale statunitensi: un esempio forte di fantascienza ad alto budget che unisce spettacolo e riflessione sul controllo sociale."
        },
        "quote": {
            "author": "Walter Murch",
            "text": "Il montaggio è la terza e ultima riscrittura di un film. La prima è la sceneggiatura, la seconda è la regia sul set.",
            "note": ""
        },
        "heroSubline": "Un secondo in più può trasformare un dramma in una commedia, e viceversa"
    },
    "06-22": {
        "person": {
            "name": "Billy Wilder",
            "birthDate": "1906-06-22",
            "note": "Gigante assoluto del cinema classico, autore di capolavori che uniscono ironia, crudeltà, precisione narrativa e intelligenza registica; nome monumentale."
        },
        "history": {
            "title": "FILM - Chi ha incastrato Roger Rabbit (Robert Zemeckis)",
            "subtitle": "1988 · uscita USA",
            "text": "Nel 1988 esce Chi ha incastrato Roger Rabbit (Robert Zemeckis): film rivoluzionario per la fusione tra live action e animazione, e ancora oggi impressionante sul piano tecnico."
        },
        "quote": {
            "author": "Nestor Almendros",
            "text": "La cinepresa non deve mai muoversi senza una ragione drammatica. Il movimento fine a se stesso è volgare.",
            "note": ""
        },
        "heroSubline": "Fai in modo che in un litigio abbiano tutti ragione"
    },
    "06-23": {
        "person": {
            "name": "Bob Fosse",
            "birthDate": "1927-06-23",
            "note": "Regista e coreografo fondamentale per il musical cinematografico, capace di trasformare il corpo, il ritmo e la messa in scena in una firma visiva inconfondibile."
        },
        "history": {
            "title": "FILM - Batman (Tim Burton)",
            "subtitle": "1989 · uscita USA",
            "text": "Nel 1989 esce Batman (Tim Burton): è una data chiave per il cinecomic moderno e per l’uso del marketing cinematografico su scala enorme."
        },
        "quote": {
            "author": "Ennio Morricone",
            "text": "La solitudine del compositore davanti al foglio pentagrammato è la cosa più difficile e meravigliosa.",
            "note": ""
        },
        "heroSubline": "Un buon produttore deve saper dire di no a un regista, anche quando quel regista è un genio"
    },
    "06-24": {
        "person": {
            "name": "Claude Chabrol",
            "birthDate": "1930-06-24",
            "note": "Padre della Nouvelle Vague e regista lucidissimo, maestro nel raccontare ipocrisie borghesi, tensioni morali e ambiguità nascoste dietro la normalità."
        },
        "history": {
            "title": "FILM - Il Re Leone (Roger Allers e Rob Minkoff)",
            "subtitle": "1994 · ampia distribuzione USA",
            "text": "Nel 1994 Il Re Leone (Roger Allers e Rob Minkoff) esce in ampia distribuzione negli Stati Uniti: diventerà uno dei più grandi successi dell’animazione mondiale."
        },
        "quote": {
            "author": "Wim Wenders",
            "text": "Il cinema è l'arte di guardare.",
            "note": ""
        },
        "heroSubline": "La chimica tra due attori non si crea a tavolino, nasce dalla fiducia reciproca"
    },
    "06-25": {
        "person": {
            "name": "Denys Arcand",
            "birthDate": "1941-06-25",
            "note": "Grande regista canadese francofono, autore colto e ironico, capace di un cinema che unisce riflessione intellettuale, politica e osservazione umana."
        },
        "history": {
            "title": "FILM - Blade Runner (Ridley Scott)",
            "subtitle": "1982 · uscita USA",
            "text": "Nel 1982 esce Blade Runner (Ridley Scott): accolto inizialmente in modo più freddo, diventerà col tempo uno dei film di fantascienza più influenti di sempre."
        },
        "quote": {
            "author": "Herman J. Mankiewicz",
            "text": "L'eroe di una storia deve essere colui che ha più da perdere.",
            "note": ""
        },
        "heroSubline": "Il ritmo non lo crea il montatore, lo scopre guardando negli occhi degli attori"
    },
    "06-26": {
        "person": {
            "name": "Paul Thomas Anderson",
            "birthDate": "1970-06-26",
            "note": "Uno dei più grandi registi americani contemporanei, autore di un cinema potentissimo sul piano formale e narrativo; nome fortissimo per qualsiasi calendario cinefilo."
        },
        "history": {
            "title": "FILM - Full Metal Jacket (Stanley Kubrick)",
            "subtitle": "1987 · distribuzione limitata USA",
            "text": "Nel 1987 Full Metal Jacket (Stanley Kubrick) esce in distribuzione limitata negli Stati Uniti: Kubrick consegna uno dei ritratti più duri e memorabili della guerra del Vietnam."
        },
        "quote": {
            "author": "Jerry Bruckheimer",
            "text": "I film potrebbero richiedere cinque, sei o a volte dieci anni per essere prodotti. Per la televisione, quando hai un'idea, la proponi e in una settimana hai una risposta.",
            "note": ""
        },
        "heroSubline": "I personaggi si definiscono per quello che fanno, non per quello che dicono"
    },
    "06-27": {
        "person": {
            "name": "J. J. Abrams",
            "birthDate": "1966-06-27",
            "note": "Regista, produttore e autore centrale del cinema e della serialità pop americana, importante per il modo in cui costruisce spettacolo, ritmo e immaginario."
        },
        "history": {
            "title": "FILM - WALL-E (Andrew Stanton)",
            "subtitle": "2008 · uscita USA",
            "text": "Nel 2008 esce WALL-E (Andrew Stanton): un film amatissimo per la sua capacità di raccontare ecologia, solitudine e amore quasi senza dialoghi."
        },
        "quote": {
            "author": "Jonathan Nolan",
            "text": "Il cinema è l'unico mezzo che ci permette di visualizzare il tempo esattamente come lo percepisce la nostra mente: frammentato e non lineare.",
            "note": ""
        },
        "heroSubline": "L'unica cosa che conta in un film è quello che arriva sullo schermo, non i litigi sul set"
    },
    "06-28": {
        "person": {
            "name": "Jon Watts",
            "birthDate": "1981-06-28",
            "note": "Regista americano emerso dall’indie e arrivato al blockbuster, interessante per la capacità di passare da piccoli film personali a grandi produzioni senza perdere chiarezza narrativa."
        },
        "history": {
            "title": "FILM - The Heat (Paul Feig)",
            "subtitle": "2013 · uscita USA",
            "text": "Nel 2013 esce The Heat (Paul Feig): una commedia poliziesca che dimostra quanto il buddy movie possa funzionare ancora anche cambiando dinamiche e protagoniste."
        },
        "quote": {
            "author": "Thelma Schoonmaker",
            "text": "Martin Scorsese e io passiamo mesi chiusi al buio. Il montaggio per noi è come una lunghissima seduta di analisi sul film.",
            "note": ""
        },
        "heroSubline": "Se non guardi l'altro negli occhi, stai recitando da solo davanti a uno specchio"
    },
    "06-29": {
        "person": {
            "name": "Riley Stearns",
            "birthDate": "1986-06-29",
            "note": "Regista americano indipendente, autore di film asciutti, stranianti e molto controllati; utile per rappresentare una sensibilità contemporanea meno convenzionale."
        },
        "history": {
            "title": "FILM - A.I. - Intelligenza Artificiale (Steven Spielberg)",
            "subtitle": "2001 · uscita USA",
            "text": "Nel 2001 esce A.I. - Intelligenza Artificiale (Steven Spielberg): film particolare e importante perché unisce la sensibilità di Spielberg a un progetto a lungo sviluppato da Kubrick."
        },
        "quote": {
            "author": "Nestor Almendros",
            "text": "Spesso le soluzioni più semplici sul set sono quelle che producono le immagini più potenti.",
            "note": ""
        },
        "heroSubline": "Il silenzio è il suono più forte che un regista possa usare"
    },
    "06-30": {
        "person": {
            "name": "Anthony Mann",
            "birthDate": "1906-06-30",
            "note": "Grande regista americano di noir e western, capace di dare durezza morale e forza visiva al cinema classico; chiusura di mese di altissimo livello."
        },
        "history": {
            "title": "FILM - Apollo 13 (Ron Howard)",
            "subtitle": "1995 · uscita USA",
            "text": "Nel 1995 esce Apollo 13 (Ron Howard): uno dei grandi esempi di cinema americano classico degli anni Novanta, capace di trasformare un fatto storico in suspense e spettacolo."
        },
        "quote": {
            "author": "John Williams",
            "text": "Cerco di scrivere melodie che le persone possano fischiare uscendo dal cinema.",
            "note": ""
        },
        "heroSubline": "Un protagonista senza un difetto fatale è solo un pezzo di cartone"
    }
});
})();
