(function(){
  "use strict";

  if(!window.AGENDA_TODAY_DATA) window.AGENDA_TODAY_DATA = { byDay: {} };
  if(!window.AGENDA_TODAY_DATA.byDay) window.AGENDA_TODAY_DATA.byDay = {};

  Object.assign(window.AGENDA_TODAY_DATA.byDay, {
        "07-01": {
            "person": {
                "name": "Sydney Pollack",
                "birthDate": "1934-07-01",
                "note": "Regista americano tra i più eleganti del secondo Novecento: da They Shoot Horses, Don’t They? a Tootsie e Out of Africa ha unito classicismo, sensibilità narrativa e grande direzione degli attori."
            },
            "history": {
                "title": "Codice Hays",
                "subtitle": "1934 · industria e censura",
                "text": "Dal 1° luglio 1934 tutti i film distribuiti negli Stati Uniti devono ottenere il Seal of Approval della Production Code Administration: è l’inizio effettivo dell’era del Codice Hays applicato con rigore."
            },
            "quote": {
                "author": "Judd Apatow",
                "text": "La commedia funziona solo se i personaggi prendono la situazione drammaticamente sul serio.",
                "note": ""
            },
            "heroSubline": "Metti insieme le persone giuste e il film si produrrà da solo"
        },
        "07-02": {
            "person": {
                "name": "Alma Har'el",
                "birthDate": "1975-07-02",
                "note": "Regista israeliana attiva tra documentario e finzione, nota per un cinema emotivo, visivo e molto contemporaneo, culminato in Honey Boy."
            },
            "history": {
                "title": "FILM - Men in Black (Barry Sonnenfeld)",
                "subtitle": "1997 · uscita USA",
                "text": "Nel 1997 esce negli USA Men in Black (Barry Sonnenfeld): fantascienza, commedia e blockbuster si fondono in uno dei film pop più riconoscibili degli anni Novanta."
            },
            "quote": {
                "author": "Jerry Bruckheimer",
                "text": "Noi siamo nel mondo dell'intrattenimento. Se il pubblico si annoia, abbiamo fallito.",
                "note": ""
            },
            "heroSubline": "Il silenzio tra due battute dice molto più delle parole stesse"
        },
        "07-03": {
            "person": {
                "name": "Ken Russell",
                "birthDate": "1927-07-03",
                "note": "Regista britannico visionario e barocco, celebre per il suo stile eccessivo e personale in film come Women in Love e The Devils."
            },
            "history": {
                "title": "FILM - Ritorno al futuro (Robert Zemeckis)",
                "subtitle": "1985 · uscita USA",
                "text": "Nel 1985 esce Ritorno al futuro (Robert Zemeckis): una delle date più felici del cinema d’intrattenimento, perfetta per ricordare il trionfo del racconto fantastico classico."
            },
            "quote": {
                "author": "Michael Kahn",
                "text": "Se non sperimenti e non fai modifiche a un taglio, non arriverai mai alla versione migliore possibile.",
                "note": ""
            },
            "heroSubline": "Non montare mai sull'azione se puoi montare sull'emozione"
        },
        "07-04": {
            "person": {
                "name": "Robert Iscove",
                "birthDate": "1947-07-04",
                "note": "Regista canadese legato al cinema e alla TV anglofona, ricordato soprattutto per She’s All That: nome utile per rappresentare un filone pop ben riconoscibile."
            },
            "history": {
                "title": "FILM - Die Hard 2 (Renny Harlin)",
                "subtitle": "1990 · uscita USA",
                "text": "Nel 1990 esce Die Hard 2 (Renny Harlin): il film usa la festa americana come data di lancio estiva, confermando John McClane come icona assoluta dell’action movie."
            },
            "quote": {
                "author": "Greig Fraser",
                "text": "L'operatore di macchina deve respirare insieme agli attori. È una danza silenziosa tra uomo e macchina.",
                "note": ""
            },
            "heroSubline": "L'antagonista è l'eroe della sua stessa storia"
        },
        "07-05": {
            "person": {
                "name": "Jean Cocteau",
                "birthDate": "1889-07-05",
                "note": "Autore francese totale — poeta, artista e regista — fondamentale per il cinema fantastico e simbolico grazie a film come La Belle et la Bête e Orphée."
            },
            "history": {
                "title": "FILM - Spider-Man: Homecoming (Jon Watts)",
                "subtitle": "2017 · uscita Regno Unito",
                "text": "Nel 2017 Spider-Man: Homecoming (Jon Watts) arriva nel Regno Unito prima dell’uscita americana: un buon esempio del lancio globale dei blockbuster contemporanei."
            },
            "quote": {
                "author": "Hans Zimmer",
                "text": "La tecnologia non fa la musica. È il cervello umano che deve avere l'idea, la tecnologia la esegue solo.",
                "note": ""
            },
            "heroSubline": "Un regista che urla sul set è un regista che sta facendo perdere tempo e denaro alla produzione"
        },
        "07-06": {
            "person": {
                "name": "Joseph Strick",
                "birthDate": "1923-07-06",
                "note": "Regista americano indipendente e colto, noto per adattamenti ambiziosi come Ulysses e Tropic of Cancer, sempre in bilico tra letteratura e cinema."
            },
            "history": {
                "title": "FILM - Forrest Gump (Robert Zemeckis)",
                "subtitle": "1994 · uscita USA",
                "text": "Nel 1994 esce Forrest Gump (Robert Zemeckis): uno dei film simbolo degli anni Novanta, capace di unire memoria americana, spettacolo popolare ed emozione."
            },
            "quote": {
                "author": "Steven Spielberg",
                "text": "L'emozione è la valuta più importante in una sala cinematografica.",
                "note": ""
            },
            "heroSubline": "Non dare all'altro la risposta che hai preparato a casa, dagli la risposta che merita in quel momento"
        },
        "07-07": {
            "person": {
                "name": "George Cukor",
                "birthDate": "1899-07-07",
                "note": "Grande maestro del cinema classico hollywoodiano, autore di The Philadelphia Story e My Fair Lady, celebre per precisione narrativa e raffinatezza formale."
            },
            "history": {
                "title": "FILM - Arma Letale 2 (Richard Donner)",
                "subtitle": "1989 · uscita USA",
                "text": "Nel 1989 esce Arma Letale 2 (Richard Donner): sequel decisivo per consolidare il buddy movie poliziesco come formula regina del cinema commerciale di fine anni Ottanta."
            },
            "quote": {
                "author": "Melissa Mathison",
                "text": "Quando scrivevo E.T., non lo vedevo come un alieno, ma come il migliore amico che ogni bambino solo vorrebbe avere.",
                "note": ""
            },
            "heroSubline": "I film tiepidi sono peggio dei film brutti: il cinema deve bruciare"
        },
        "07-08": {
            "person": {
                "name": "Michael Cuesta",
                "birthDate": "1963-07-08",
                "note": "Regista americano capace di muoversi tra cinema e serialità di qualità, noto per L.I.E. e per un approccio sobrio ma incisivo al racconto."
            },
            "history": {
                "title": "FILM - Spider-Man 2 (Sam Raimi)",
                "subtitle": "2004 · uscita estiva",
                "text": "Nel 2004 arriva Spider-Man 2 (Sam Raimi), spesso considerato uno dei migliori cinecomic di sempre: un caso perfetto di sequel capace di alzare il livello del franchise."
            },
            "quote": {
                "author": "Kathleen Kennedy",
                "text": "Produrre significa avere la capacità di vedere il quadro generale mentre tutti gli altri sono concentrati sui dettagli.",
                "note": ""
            },
            "heroSubline": "Se un personaggio parla come un libro stampato, riscrivilo"
        },
        "07-09": {
            "person": {
                "name": "Elem Klimov",
                "birthDate": "1933-07-09",
                "note": "Regista sovietico di enorme forza espressiva, autore del devastante Come and See, uno dei film più potenti mai realizzati sulla guerra."
            },
            "history": {
                "title": "FILM - Tron (Steven Lisberger)",
                "subtitle": "1982 · uscita USA",
                "text": "Nel 1982 esce Tron (Steven Lisberger): una tappa fondamentale per il rapporto tra cinema, videogiochi, mondi digitali ed effetti visivi."
            },
            "quote": {
                "author": "Tom Cross (Whiplash)",
                "text": "Nel montaggio non cerchiamo solo il ritmo visivo, ma il ritmo musicale che muove l'intera storia.",
                "note": ""
            },
            "heroSubline": "Il cinema non è un'arte per solitari; è il gioco di squadra più costoso del mondo"
        },
        "07-10": {
            "person": {
                "name": "Ellen Kuras",
                "birthDate": "1959-07-10",
                "note": "Regista e direttrice della fotografia americana, figura importante per il cinema indipendente e documentario, capace di coniugare rigore visivo e sensibilità umana."
            },
            "history": {
                "title": "FILM - Harry Potter e l'Ordine della Fenice (David Yates)",
                "subtitle": "2007 · uscita USA",
                "text": "Nel 2007 esce Harry Potter e l'Ordine della Fenice (David Yates) negli Stati Uniti: un passaggio importante nella maturazione più cupa e politica della saga."
            },
            "quote": {
                "author": "Christopher Doyle",
                "text": "La macchina da presa è un'estensione del mio corpo. Se io non provo un'emozione, l'inquadratura sarà fredda.",
                "note": ""
            },
            "heroSubline": "Nelle scene di gruppo, chi non parla deve essere vivo quanto chi sta parlando"
        },
        "07-11": {
            "person": {
                "name": "Jafar Panahi",
                "birthDate": "1960-07-11",
                "note": "Uno dei maggiori registi iraniani contemporanei: il suo cinema unisce essenzialità, libertà creativa e resistenza civile, trasformando ogni film in un gesto artistico e politico."
            },
            "history": {
                "title": "FILM - Harry Potter e l'Ordine della Fenice (David Yates)",
                "subtitle": "2007 · uscita internazionale",
                "text": "Nel 2007 Harry Potter e l'Ordine della Fenice (David Yates) arriva anche in altri mercati e domina il box office mondiale: un buon momento per parlare di franchise letterari trasformati in fenomeni globali."
            },
            "quote": {
                "author": "Howard Shore",
                "text": "Per Il Signore degli Anelli volevo una musica che sembrasse antica, come se fosse stata estratta direttamente dalla terra della Terra di Mezzo.",
                "note": ""
            },
            "heroSubline": "Il tempo al cinema è una materia plastica: puoi dilatarlo o comprimerlo a piacimento"
        },
        "07-12": {
            "person": {
                "name": "Monte Hellman",
                "birthDate": "1929-07-12",
                "note": "Regista americano di culto, autore di western e road movie atipici come Two-Lane Blacktop: una figura chiave per il cinema indipendente più asciutto e radicale."
            },
            "history": {
                "title": "FILM - Die Hard (John McTiernan)",
                "subtitle": "1988 · anteprima",
                "text": "Nel 1988 Die Hard (John McTiernan) debutta in anteprima e si prepara a cambiare per sempre il cinema action: ironia, spazi chiusi e un eroe molto più vulnerabile del solito."
            },
            "quote": {
                "author": "Christopher Nolan",
                "text": "Cerco sempre di creare un'esperienza immersiva per lo spettatore.",
                "note": ""
            },
            "heroSubline": "Dai al pubblico ciò di cui ha bisogno, non ciò che vuole"
        },
        "07-13": {
            "person": {
                "name": "Cameron Crowe",
                "birthDate": "1957-07-13",
                "note": "Regista e sceneggiatore americano capace di fondere racconto generazionale, musica e sentimento in film come Jerry Maguire, Almost Famous e Say Anything."
            },
            "history": {
                "title": "FILM - Ghost (Jerry Zucker)",
                "subtitle": "1990 · uscita USA",
                "text": "Nel 1990 esce Ghost (Jerry Zucker): melodramma romantico, fantastico e pop, uno di quei casi in cui un film apparentemente “ibrido” diventa un successo enorme."
            },
            "quote": {
                "author": "Ernest Lehman",
                "text": "Un buon dialogo deve fare due cose contemporaneamente: portare avanti la trama e rivelare il personaggio.",
                "note": ""
            },
            "heroSubline": "Il lavoro del produttore è proteggere gli artisti da loro stessi"
        },
        "07-14": {
            "person": {
                "name": "Ingmar Bergman",
                "birthDate": "1918-07-14",
                "note": "Uno dei massimi registi della storia del cinema: autore di Il settimo sigillo, Persona e Fanny e Alexander, ha trasformato il film in un’indagine sull’anima, sul silenzio e sul dubbio."
            },
            "history": {
                "title": "FILM - X-Men (Bryan Singer)",
                "subtitle": "2000 · uscita USA",
                "text": "Nel 2000 X-Men (Bryan Singer) arriva nelle sale e mostra che il cinecomic può diventare un vero pilastro dell’industria contemporanea."
            },
            "quote": {
                "author": "Kathleen Kennedy",
                "text": "Non puoi avere paura del fallimento se vuoi fare qualcosa di veramente originale.",
                "note": ""
            },
            "heroSubline": "L'energia sul set si moltiplica solo se la condividi con i tuoi colleghi"
        },
        "07-15": {
            "person": {
                "name": "Ari Aster",
                "birthDate": "1986-07-15",
                "note": "Regista americano tra i più incisivi della nuova generazione, noto per Hereditary e Midsommar, dove l’horror diventa trauma, rito e visione."
            },
            "history": {
                "title": "FILM - Die Hard (John McTiernan)",
                "subtitle": "1988 · uscita USA",
                "text": "Nel 1988 esce ufficialmente Die Hard (John McTiernan) negli Stati Uniti: è una data chiave per l’action moderno, più fisico, ironico e urbano."
            },
            "quote": {
                "author": "Joe Hutshing (Almost Famous)",
                "text": "Il film ti dice lui stesso come vuole essere montato. Devi solo imparare ad ascoltarlo.",
                "note": ""
            },
            "heroSubline": "Un piano sequenza senza tensione interna è solo un costoso esercizio di stile"
        },
        "07-16": {
            "person": {
                "name": "Scott Derrickson",
                "birthDate": "1966-07-16",
                "note": "Regista americano specializzato nel cinema di tensione e soprannaturale, capace di coniugare paura, costruzione visiva e ritmo narrativo in film come Sinister e The Black Phone."
            },
            "history": {
                "title": "FILM - Inception (Christopher Nolan)",
                "subtitle": "2010 · uscita USA",
                "text": "Nel 2010 esce Inception (Christopher Nolan): blockbuster ad alta complessità che dimostra come il grande cinema spettacolare possa anche essere concettualmente ambizioso."
            },
            "quote": {
                "author": "Christopher Doyle",
                "text": "Sbagliare l'esposizione o l'inquadratura a volte può rivelare una verità visiva che non avevi previsto.",
                "note": ""
            },
            "heroSubline": "Il silenzio sulla pagina deve gridare più forte delle parole"
        },
        "07-17": {
            "person": {
                "name": "F. Gary Gray",
                "birthDate": "1969-07-17",
                "note": "Regista americano passato dai videoclip al grande schermo, autore di Friday, Set It Off e Straight Outta Compton: un nome importante per energia, ritmo e cultura urbana."
            },
            "history": {
                "title": "FILM - The Dark Knight (Christopher Nolan)",
                "subtitle": "2008 · anteprima",
                "text": "Nel 2008 The Dark Knight (Christopher Nolan) debutta in anteprima e trasforma il film di supereroi in un evento culturale mondiale."
            },
            "quote": {
                "author": "Jerry Goldsmith",
                "text": "Il mio lavoro non è comporre musica che piaccia a me, ma musica che completi la visione del regista.",
                "note": ""
            },
            "heroSubline": "Se l'attore protagonista è felice, il set corre veloce; se è scontento, i costi raddoppiano"
        },
        "07-18": {
            "person": {
                "name": "Paul Verhoeven",
                "birthDate": "1938-07-18",
                "note": "Regista olandese tra i più provocatori e intelligenti del cinema moderno, autore di RoboCop, Basic Instinct, Starship Troopers e Elle."
            },
            "history": {
                "title": "FILM - The Dark Knight (Christopher Nolan)",
                "subtitle": "2008 · uscita USA",
                "text": "Nel 2008 The Dark Knight (Christopher Nolan) esce in ampia distribuzione negli Stati Uniti: uno dei grandi spartiacque del blockbuster del XXI secolo."
            },
            "quote": {
                "author": "Hayao Miyazaki",
                "text": "Creare un film significa creare un mondo parallelo a quello reale.",
                "note": ""
            },
            "heroSubline": "Un cattivo partner di scena rende brutta anche la tua migliore interpretazione"
        },
        "07-19": {
            "person": {
                "name": "Abel Ferrara",
                "birthDate": "1951-07-19",
                "note": "Regista americano ruvido e personalissimo, autore di Bad Lieutenant e The Addiction, capace di portare sullo schermo colpa, desiderio e disordine morale."
            },
            "history": {
                "title": "FILM - Ragazze a Beverly Hills (Amy Heckerling)",
                "subtitle": "1995 · uscita USA",
                "text": "Nel 1995 esce Ragazze a Beverly Hills (Amy Heckerling): commedia giovanile ironica e influentissima, destinata a diventare un vero oggetto di culto della cultura pop anni Novanta."
            },
            "quote": {
                "author": "David Mamet",
                "text": "Nessuno parla mai per trasmettere informazioni. Le persone parlano per ottenere ciò che vogliono dagli altri.",
                "note": ""
            },
            "heroSubline": "Lascia respirare l'inquadratura prima di chiamare lo 'stacco'"
        },
        "07-20": {
            "person": {
                "name": "Randal Kleiser",
                "birthDate": "1946-07-20",
                "note": "Regista americano noto soprattutto per Grease e The Blue Lagoon: un nome forte per il cinema pop e spettacolare tra anni Settanta e Ottanta."
            },
            "history": {
                "title": "Apollo 11 e immaginario spaziale",
                "subtitle": "1969 · storia e fantascienza",
                "text": "Il 20 luglio resta legato all’immaginario spaziale di Apollo 11 e per questo è una data perfetta per ricordare quanto il cinema di fantascienza e il cinema spaziale abbiano dialogato con la storia reale dell’esplorazione."
            },
            "quote": {
                "author": "Jason Blum",
                "text": "Se tieni i budget bassi, puoi permetterti di correre rischi creativi enormi.",
                "note": ""
            },
            "heroSubline": "Un personaggio deve sempre volere qualcosa, anche solo un bicchiere d'acqua."
        },
        "07-21": {
            "person": {
                "name": "Norman Jewison",
                "birthDate": "1926-07-21",
                "note": "Regista canadese di grande solidità classica, autore di In the Heat of the Night, Fiddler on the Roof e Moonstruck, sempre attento ai temi sociali e al racconto accessibile."
            },
            "history": {
                "title": "FILM - Harry, ti presento Sally... (Rob Reiner)",
                "subtitle": "1989 · uscita USA",
                "text": "Nel 1989 esce Harry, ti presento Sally... (Rob Reiner): una delle commedie romantiche più importanti del cinema americano moderno, brillante e ancora oggi citatissima."
            },
            "quote": {
                "author": "Anne V. Coates",
                "text": "A volte devi tagliare la tua inquadratura preferita perché rallenta il film. È una regola crudele ma necessaria.",
                "note": ""
            },
            "heroSubline": "L'autorità non si compra con il budget, si guadagna con il rispetto verso la troupe"
        },
        "07-22": {
            "person": {
                "name": "Paul Schrader",
                "birthDate": "1946-07-22",
                "note": "Regista e sceneggiatore americano di enorme importanza, autore di American Gigolo, Mishima e First Reformed, nonché una delle voci più lucide del cinema moderno americano."
            },
            "history": {
                "title": "FILM - Chi ha incastrato Roger Rabbit (Robert Zemeckis)",
                "subtitle": "1988 · uscita estiva",
                "text": "Nel 1988 esce Chi ha incastrato Roger Rabbit (Robert Zemeckis) in diversi mercati estivi: un ottimo spunto per parlare della fusione rivoluzionaria tra live action e animazione."
            },
            "quote": {
                "author": "Tonino Delli Colli",
                "text": "Un buon operatore deve saper guardare la realtà con gli occhi del regista, ma illuminarla con il proprio cuore.",
                "note": ""
            },
            "heroSubline": "Trova l'animale che c'è nel tuo personaggio"
        },
        "07-23": {
            "person": {
                "name": "Jan Troell",
                "birthDate": "1931-07-23",
                "note": "Regista svedese di grande prestigio internazionale, autore di un cinema rigoroso, storico e profondamente umano, come in The Emigrants e The New Land."
            },
            "history": {
                "title": "FILM - Eyes Wide Shut (Stanley Kubrick)",
                "subtitle": "1999 · uscita USA",
                "text": "Nel 1999 esce Eyes Wide Shut (Stanley Kubrick): l’ultimo film di Kubrick arriva nelle sale e diventa subito un oggetto di discussione, mistero e interpretazioni contrastanti."
            },
            "quote": {
                "author": "Alexandre Desplat",
                "text": "La musica deve essere fluida come l'acqua, deve scivolare tra i dialoghi senza mai disturbarli.",
                "note": ""
            },
            "heroSubline": "Il montaggio invisibile è il più difficile da realizzare"
        },
        "07-24": {
            "person": {
                "name": "Gus Van Sant",
                "birthDate": "1952-07-24",
                "note": "Regista americano capace di alternare cinema indipendente e produzioni più ampie, sempre mantenendo uno sguardo sensibile sulle identità, i margini e il paesaggio emotivo."
            },
            "history": {
                "title": "FILM - Salvate il soldato Ryan (Steven Spielberg)",
                "subtitle": "1998 · uscita USA",
                "text": "Nel 1998 esce Salvate il soldato Ryan (Steven Spielberg): una delle date cruciali per il war movie contemporaneo, anche per l’impatto tecnico e visivo della scena iniziale dello sbarco."
            },
            "quote": {
                "author": "Pedro Almodóvar",
                "text": "I miei film non sono sulla realtà, ma sui desideri.",
                "note": ""
            },
            "heroSubline": "Metti due persone in una stanza che non sono d'accordo su nulla e avrai una scena"
        },
        "07-25": {
            "person": {
                "name": "Raúl Ruiz",
                "birthDate": "1941-07-25",
                "note": "Regista cileno tra i più originali e inesauribili del cinema mondiale, autore di un’opera sterminata fatta di labirinti narrativi, invenzione visiva e libertà assoluta."
            },
            "history": {
                "title": "FILM - Easy Rider (Dennis Hopper)",
                "subtitle": "1969 · uscita USA",
                "text": "Nel 1969 esce Easy Rider (Dennis Hopper): tappa fondamentale della New Hollywood, perfetta per parlare di controcultura, libertà e trasformazione del cinema americano."
            },
            "quote": {
                "author": "John August",
                "text": "Se un personaggio non ha un obiettivo chiaro, lo spettatore smetterà presto di preoccuparsi per lui.",
                "note": ""
            },
            "heroSubline": "Un buon produttore deve saper vedere il film finito nella sua testa prima ancora che venga battuto il primo ciak"
        },
        "07-26": {
            "person": {
                "name": "Blake Edwards",
                "birthDate": "1922-07-26",
                "note": "Regista americano fondamentale per la commedia sofisticata e slapstick, celebre per Colazione da Tiffany e per la serie della Pantera Rosa."
            },
            "history": {
                "title": "FILM - Era mio padre (Sam Mendes)",
                "subtitle": "2002 · successo estivo",
                "text": "Nel 2002 il successo estivo di Era mio padre (Sam Mendes) mostra che luglio non è solo mese di franchise, ma anche di cinema adulto e spettacolare insieme."
            },
            "quote": {
                "author": "Roger Corman",
                "text": "Una delle cose peggiori che puoi fare è avere un budget limitato e cercare di fare un film che sembri mastodontico. Finisci solo per fare un pessimo lavoro.",
                "note": ""
            },
            "heroSubline": "I difetti rendono un personaggio umano; la perfezione lo rende noioso"
        },
        "07-27": {
            "person": {
                "name": "Takashi Shimizu",
                "birthDate": "1972-07-27",
                "note": "Regista giapponese noto soprattutto per Ju-On / The Grudge, figura chiave dell’horror asiatico contemporaneo grazie a uno stile essenziale e perturbante."
            },
            "history": {
                "title": "FILM - Planet of the Apes - Il pianeta delle scimmie (Tim Burton)",
                "subtitle": "2001 · uscita USA",
                "text": "Nel 2001 esce Planet of the Apes - Il pianeta delle scimmie (Tim Burton): film importante non tanto per il risultato artistico, quanto per il peso del remake come strategia industriale del cinema contemporaneo."
            },
            "quote": {
                "author": "Christopher McQuarrie",
                "text": "Se la scena d'azione non ha una posta in gioco emotiva per il personaggio, sono solo macchine che si scontrano.",
                "note": ""
            },
            "heroSubline": "Se una scena non serve a far progredire la trama o a svelare il personaggio, tagliala"
        },
        "07-28": {
            "person": {
                "name": "David Pablos",
                "birthDate": "1982-07-28",
                "note": "Regista messicano di area autoriale, premiato in festival importanti e capace di affrontare temi duri con sguardo asciutto e controllo formale."
            },
            "history": {
                "title": "FILM - Miami Vice (Michael Mann)",
                "subtitle": "2006 · uscita USA",
                "text": "Nel 2006 esce Miami Vice (Michael Mann): un grande esempio di blockbuster d’autore, nervoso, digitale, notturno e tutt’altro che convenzionale."
            },
            "quote": {
                "author": "Richard Chew (Star Wars)",
                "text": "Montare significa manipolare l'attenzione del pubblico, decidere esattamente quando fargli battere ciglio.",
                "note": ""
            },
            "heroSubline": "I comprimari sono i protagonisti di un altro film che sta accadendo fuori campo"
        },
        "07-29": {
            "person": {
                "name": "Ken Burns",
                "birthDate": "1953-07-29",
                "note": "Documentarista americano tra i più influenti degli ultimi decenni: ha trasformato il racconto storico audiovisivo in un linguaggio riconoscibile, rigoroso e popolare."
            },
            "history": {
                "title": "FILM - Chi ha incastrato Roger Rabbit (Robert Zemeckis)",
                "subtitle": "1988 · corsa estiva",
                "text": "Nel 1988 Chi ha incastrato Roger Rabbit (Robert Zemeckis) continua la sua corsa estiva e conferma che il cinema può essere insieme virtuosismo tecnico, noir, commedia e nostalgia classica."
            },
            "quote": {
                "author": "Darius Khondji",
                "text": "L'inquadratura è come una prigione. Decidere cosa lasciare fuori campo è importante quanto ciò che mostri.",
                "note": ""
            },
            "heroSubline": "Il pubblico non sa mai cosa vuole finché non glielo dai"
        },
        "07-30": {
            "person": {
                "name": "Christopher Nolan",
                "birthDate": "1970-07-30",
                "note": "Uno dei registi più importanti del cinema contemporaneo, capace di unire ambizione intellettuale, spettacolo e controllo formale in opere come Memento, Inception, Dunkirk e Oppenheimer."
            },
            "history": {
                "title": "FILM - A.I. - Intelligenza Artificiale (Steven Spielberg)",
                "subtitle": "2001 · estate cinematografica",
                "text": "Nel 2001 A.I. - Intelligenza Artificiale (Steven Spielberg) raggiunge il cuore dell’estate cinematografica: film importante anche perché incrocia idealmente le visioni di Kubrick e Spielberg."
            },
            "quote": {
                "author": "Rachel Portman",
                "text": "Scrivere musica per il cinema significa essere disposti a spogliarsi del proprio ego a favore della storia.",
                "note": ""
            },
            "heroSubline": "Ogni personaggio vuole qualcosa: scopri qual è il suo obiettivo e inseguilo"
        },
        "07-31": {
            "person": {
                "name": "Mario Bava",
                "birthDate": "1914-07-31",
                "note": "Grande nome italiano del mese: maestro del fantastico e dell’orrore, ha lasciato un’impronta decisiva sul cinema di genere con film come La maschera del demonio e Operazione paura."
            },
            "history": {
                "title": "FILM - Terminator 2: Il Giorno del Giudizio (James Cameron)",
                "subtitle": "1991 · successo estivo",
                "text": "Nel 1991 Terminator 2: Il Giorno del Giudizio (James Cameron) continua a dominare l’estate dopo l’uscita di inizio mese, imponendosi come modello assoluto di sequel, action e rivoluzione digitale."
            },
            "quote": {
                "author": "Guillermo del Toro",
                "text": "I mostri sono i santi patroni delle nostre imperfezioni.",
                "note": ""
            },
            "heroSubline": "Il ritmo di un film deve assomigliare al battito cardiaco dello spettatore"
        }
    });
})();
