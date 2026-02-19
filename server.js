import express from "express";

import { Liquid } from "liquidjs";

// Vul hier jullie team naam in
const teamName = "Dazzle";

const app = express();

app.use(express.static("public"));

const engine = new Liquid();
app.engine("liquid", engine.express());

app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));

app.get("/", async function (request, response) {
  // Filter eerst de berichten die je wilt zien, net als bij personen
  // Deze tabel wordt gedeeld door iedereen, dus verzin zelf een handig filter,
  // bijvoorbeeld je teamnaam, je projectnaam, je person ID, de datum van vandaag, etc..
  const messageParams = {
    "filter[for]": `Team ${teamName}`,
  }
  // Maak hiermee de URL aan, zoals we dat ook in de browser deden
  const apiURL =
    "https://fdnd.directus.app/items/messages?" + new URLSearchParams(messageParams);

  // Laat eventueel zien wat de filter URL is
  // (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
  // console.log('API URL voor messages:', apiURL)

  // Haal daarna de messages data op
  const messagesResponse = await fetch(apiURL);

  // Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
  const messagesResponseJSON = await messagesResponse.json();

  // const parampersons = {
  //   'filter[]' :
  // }
  // we get the sort query string from the request (everything after ?sort= will be used as the sorting method)
  let sort = request.query.sort;

  // if sort is not defined (is not in the url), we sort by name
  if (!sort) {
    sort = "name";
  }

  const params = {
    sort: sort,
    fields: "*,squads.*",
    // Combineer meerdere filters
    "filter[squads][squad_id][tribe][name]": "FDND Jaar 1",
    // Filter eventueel alleen op een bepaalde squad
    // 'filter[squads][squad_id][name]': '1J',
    // 'filter[squads][squad_id][name]': '1I',
    'filter[squads][squad_id][cohort]': '2526'
  };
  const personResponse = await fetch(
    "https://fdnd.directus.app/items/person/?" + new URLSearchParams(params),
  );

  const personResponseJSON = await personResponse.json();

  // Controleer eventueel de data in je console
  // console.log(messagesResponseJSON)

  // En render de view met de messages
    const cleanSort = sort.replace("-", "");
    response.render("squad.liquid", {
    persons: personResponseJSON.data,
    cleanSort: cleanSort,
    activeSort: sort,
    title: "Alle squads ",
  });
});

app.post("/", async function (request, response) {
  // Stuur een POST request naar de messages tabel
  // Een POST request bevat ook extra parameters, naast een URL
  await fetch("https://fdnd.directus.app/items/messages", {
    // Overschrijf de standaard GET method, want ook hier gaan we iets veranderen op de server
    method: "POST",

    // Geef de body mee als JSON string
    body: JSON.stringify({
      // Dit is zodat we ons bericht straks weer terug kunnen vinden met ons filter
      for: `Team ${teamName}`,
      // En dit zijn onze formuliervelden
      from: request.body.from,
      text: request.body.text,
    }),

    // En vergeet deze HTTP headers niet: hiermee vertellen we de server dat we JSON doorsturen
    // (In realistischere projecten zou je hier ook authentication headers of een sleutel meegeven)
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
  });

  // Stuur de browser daarna weer naar de homepage
  response.redirect(303, "/");
});

app.set("port", process.env.PORT || 8000);

if (teamName == "") {
  console.log("Voeg eerst de naam van jullie team in de code toe.");
} else {
  app.listen(app.get("port"), function () {
    console.log(`Application started on http://localhost:${app.get("port")}`);
  });
}

// // !!!!!!!!!!!!!!!!!!!!!!!!!!!! Dit linked naar mijn VERJAARDAG pagina !!!!!!!!!!!!!!!!!!!!!!!!!!!!
// app.get('/verjaardag', async function (request, response) {
//   const params = {
//     'sort': 'name',
//     'fields': '*,squads.*',
//     // Combineer meerdere filters
//     'filter[squads][squad_id][tribe][name]': 'FDND Jaar 1',
//     // Filter eventueel alleen op een bepaalde squad
//     // 'filter[squads][squad_id][name]': '1I',
//     // 'filter[squads][squad_id][name]': '1J',
//     'filter[squads][squad_id][cohort]': '2526'
//   }
//   const personResponse = await fetch('https://fdnd.directus.app/items/person/?' + new URLSearchParams(params))
//   const personResponseJSON = await personResponse.json()
//   response.render('verjaardag.liquid', {persons: personResponseJSON.data})
// })

// // zorgt voor JONG OUD
// app.get('/jong-oud', async function (request, response) {
//   const params = {
//     // Sorteer op naam
//     'sort': '-birthdate',

//     // Geef aan welke data je per persoon wil terugkrijgen
//     'fields': '*,squads.*',

//     // Combineer meerdere filters
//     'filter[squads][squad_id][tribe][name]': 'FDND Jaar 1',
//     // Filter eventueel alleen op een bepaalde squad
//     // 'filter[squads][squad_id][name]': '1I',
//     // 'filter[squads][squad_id][name]': '1J',
//     'filter[squads][squad_id][cohort]': '2526'
//   }
//   const personResponse = await fetch('https://fdnd.directus.app/items/person/?' + new URLSearchParams(params))

//   // En haal daarvan de JSON op
//   const personResponseJSON = await personResponse.json()
//   response.render('verjaardag.liquid', {persons: personResponseJSON.data})
// })

// // zorgt voor OUD JONG
// app.get('/oud-jong', async function (request, response) {
//   const params = {
//     // Sorteer op naam
//     'sort': 'birthdate',

//     // Geef aan welke data je per persoon wil terugkrijgen
//     'fields': '*,squads.*',

//     // Combineer meerdere filters
//     'filter[squads][squad_id][tribe][name]': 'FDND Jaar 1',
//     // Filter eventueel alleen op een bepaalde squad
//     // 'filter[squads][squad_id][name]': '1I',
//     // 'filter[squads][squad_id][name]': '1J',
//     'filter[squads][squad_id][cohort]': '2526'
//   }
//   const personResponse = await fetch('https://fdnd.directus.app/items/person/?' + new URLSearchParams(params))

//   // En haal daarvan de JSON op
//   const personResponseJSON = await personResponse.json()
//   response.render('verjaardag.liquid', {persons: personResponseJSON.data})
// })

// !!!!!!!!!!!!!!!!!!!!!!!!!!!! Dit linked naar mijn VIBE-EMOJI pagina !!!!!!!!!!!!!!!!!!!!!!!!!!!!
// app.get('/vibe-emoji', async function (request, response) {
//   const params = {
//     'sort': 'name',
//     'fields': '*,squads.*',
//     // Combineer meerdere filters
//     'filter[squads][squad_id][tribe][name]': 'FDND Jaar 1',
//     // Filter eventueel alleen op een bepaalde squad
//     // 'filter[squads][squad_id][name]': '1I',
//     // 'filter[squads][squad_id][name]': '1J',
//     'filter[squads][squad_id][cohort]': '2526'
//   }
//   const personResponse = await fetch('https://fdnd.directus.app/items/person/?' + new URLSearchParams(params))
//   const personResponseJSON = await personResponse.json()
//   response.render('vibe-emoji.liquid', {persons: personResponseJSON.data})
// })

// !!!!!!!!!!!!!!!!!!!!!!!!!!!! Dit linked naar mijn SQUAD pagina !!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get("/squad/:squadId", async function (request, response) {
  console.log(request.query);

  // We take :squadId from the url, by asking for the params on the request.
  // We turn the params to uppercase because the api expects an uppercase value
  const squadId = request.params.squadId.toUpperCase();

  // we get the sort query string from the request (everything after ?sort= will be used as the sorting method)
  let sort = request.query.sort;

  // if sort is not defined (is not in the url), we sort by name
  if (!sort) {
    sort = "name";
  }

  const params = {
    sort: sort,
    fields: "*,squads.*",
    // Combineer meerdere filters
    "filter[squads][squad_id][tribe][name]": "FDND Jaar 1",
    // Filter eventueel alleen op een bepaalde squad
    "filter[squads][squad_id][name]": squadId,
    // 'filter[squads][squad_id][name]': '1J',
    // 'filter[squads][squad_id][cohort]': '2526'
  };
  const personResponse = await fetch(
    "https://fdnd.directus.app/items/person/?" + new URLSearchParams(params),
  );
  console.log(squadId)
  const personResponseJSON = await personResponse.json();

  // remove dash (-) from sorting method so it's always sent like 'birthdate' and never '-birthdate'
  const cleanSort = sort.replace("-", "");
  response.render("squad.liquid", {
    persons: personResponseJSON.data,
    cleanSort: cleanSort,
    activeSort: sort,
    activeSquad:squadId,
    title: "Squad " + squadId,
  });
});

// zorgt voor SQAUD 1I
// app.get('/squad1i', async function (request, response) {
//   const params = {
//     // Sorteer op naam
//     'sort': 'name',

//     // Geef aan welke data je per persoon wil terugkrijgen
//     'fields': '*,squads.*',

//     // Combineer meerdere filters
//     'filter[squads][squad_id][tribe][name]': 'FDND Jaar 1',
//     // Filter eventueel alleen op een bepaalde squad
//     'filter[squads][squad_id][name]': '1I',
//     // 'filter[squads][squad_id][name]': '1J',
//     // 'filter[squads][squad_id][cohort]': '2526'
//   }
//   const personResponse = await fetch('https://fdnd.directus.app/items/person/?' + new URLSearchParams(params))

//   // En haal daarvan de JSON op
//   const personResponseJSON = await personResponse.json()
//   response.render('squad.liquid', {persons: personResponseJSON.data})
// })

// // zorgt voor SQAUD 1J
// app.get('/squad1j', async function (request, response) {
//   const params = {
//     // Sorteer op naam
//     'sort': 'name',

//     // Geef aan welke data je per persoon wil terugkrijgen
//     'fields': '*,squads.*',

//     // Combineer meerdere filters
//     'filter[squads][squad_id][tribe][name]': 'FDND Jaar 1',
//     // Filter eventueel alleen op een bepaalde squad
//     // 'filter[squads][squad_id][name]': '1I',
//     'filter[squads][squad_id][name]': '1J',
//     // 'filter[squads][squad_id][cohort]': '2526'
//   }
//   const personResponse = await fetch('https://fdnd.directus.app/items/person/?' + new URLSearchParams(params))

//   // En haal daarvan de JSON op
//   const personResponseJSON = await personResponse.json()
//   response.render('squad.liquid', {persons: personResponseJSON.data})
// })

// NAAM
// zorgt voor AZ
// app.get("/a-z", async function (request, response) {
//   const params = {
//     // Sorteer op naam
//     sort: "name",

//     // Geef aan welke data je per persoon wil terugkrijgen
//     fields: "*,squads.*",

//     // Combineer meerdere filters
//     "filter[squads][squad_id][tribe][name]": "FDND Jaar 1",
//     // Filter eventueel alleen op een bepaalde squad
//     // 'filter[squads][squad_id][name]': '1I',
//     // 'filter[squads][squad_id][name]': '1J',
//     "filter[squads][squad_id][cohort]": "2526",
//   };
//   const personResponse = await fetch(
//     "https://fdnd.directus.app/items/person/?" + new URLSearchParams(params),
//   );

//   // En haal daarvan de JSON op
//   const personResponseJSON = await personResponse.json();
//   response.render("index.liquid", { persons: personResponseJSON.data });
// });

// // zorgt voor ZA
// app.get("/z-a", async function (request, response) {
//   const params = {
//     // Sorteer op naam
//     sort: "-name",

//     // Geef aan welke data je per persoon wil terugkrijgen
//     fields: "*,squads.*",

//     // Combineer meerdere filters
//     "filter[squads][squad_id][tribe][name]": "FDND Jaar 1",
//     // Filter eventueel alleen op een bepaalde squad
//     // 'filter[squads][squad_id][name]': '1I',
//     // 'filter[squads][squad_id][name]': '1J',
//     "filter[squads][squad_id][cohort]": "2526",
//   };
//   const personResponse = await fetch(
//     "https://fdnd.directus.app/items/person/?" + new URLSearchParams(params),
//   );

//   // En haal daarvan de JSON op
//   const personResponseJSON = await personResponse.json();
//   response.render("index.liquid", { persons: personResponseJSON.data });
// });

app.get('/', async function (request, response) {
  const search = request.query.search;

  const params = { 
    fields: "*,squads.*",
    sort: "name"
  }
  if (search) {
    params.search = searchquery
  }

  const personResponse = await fetch(
    "https://fdnd.directus.app/items/person/?" + new URLSearchParams(params)
  )
})

