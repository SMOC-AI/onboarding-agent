# Sikkerhetsvurdering

## Formål og avgrensning

I denne teksten vurderer jeg sikkerhet og personvern i onboarding løsningen min. Vurderingen gjelder kun denne løsningen og de forskjellige komponentene i repoet, ikke annen sikkerhet i tredjepartstjenester som Cloudflare, Clerk eller Payload.

## Sikkerhetsbilde

Appen har en tydelig ansvarsdeling mellom klient og server. Frontend håndterer brukeropplevelse og tidlig validering, mens backend tar seg av sikkerhetskontroller før data kan behandles videre. API routen er beskyttet av autentisering, og kommunikasjon mot Payload går via Worker-til-Worker binding i stedet for direkte klient kall. Dette reduserer eventuelle leaks av hemmelig data.

## Autentisering og tilgang

Til autentisering brukes Clerk i. Beskyttede routes er `/`, `/sporsmal` og `/api/onboarding`. En uautentisert bruker blir stoppet før onboarding kan sendes inn, og API returnerer `401` om `locals.session` mangler.

Løsningen er satt opp med fail-closed prinsipp for beskyttede ruter. Det vil si at hvis `CLERK_SECRET_KEY` mangler i runtime, returnerer serveren `500` i stedet for å slippe bruker gjennom uten auth. Dette er et bevisst sikkerhetsvalg for å unngå at det eventuelt åpner systemet når det ikke skal.

## Inputvalidering og dataintegritet

Det er implementert validering i to lag. I frontend brukes `validateText` for å gi rask tilbakemelding til bruker og i backend brukes `isValidOnboardingRequest` for å passe på at payload følger forventet struktur, med gyldig `companyName` og gyldige `answers`.

## Kommunikasjon og transport av data

Kommunikasjonen til Payload går gjennom en service binding. I praksis betyr det at onboarding workeren snakker direkte med Payload workeren internt i Cloudflare. Det er tryggere enn at klienten skal skrive direkte selv, og gir bedre kontroll på hvem som faktisk kan sende inn data.

## Feilhåndtering og sikker respons

API routen bruker tydelige HTTP statuskoder:
- `400` ved ugyldig JSON eller payload
- `401` ved manglende innlogging
- `500` ved manglende intern konfigurasjon
- `502` ved feil mot Payload eller nettverksfeil

Responsene inneholder funksjonelle feilmeldinger, men jeg har holdt de litt generelle for å unngå å vise for mye om intern logikk eller oppsett. Frontend håndterer timeout, nettverksfeil og serverfeil med brukervennlige meldinger, slik at feil ikke feiler stille.

## GDPR

Dataen som behandles i denne flyten er for det meste bedrifts relatert informasjon. Appen lagrer ikke passord eller lignende i koden. Personvern er tatt hensyn til ved at vi samler inn bare det vi trenger, bruker tilgangskontroll via Clerk, og holder sensitive keys i runtime konfigurasjon i stedet for i repo.

## Risikoanalyse

Potensielle risikoer som kan skje er feil i auth/secrets oppsett, ugyldig data inn til API, og ustabilitet i tjenester vi er avhengige av. Tiltak som allerede er på plass er fail-closed auth, backend validering og kontrollert feilhåndtering. Annen risiko ligger da mest i eksterne avhengigheter, for eksempel driftsfeil hos tredjepart, og i manuell konfigurasjon av secrets osv.

## Tiltak for videre forbedring

Neste naturlige sikkerhetstiltak kan være å lage f.eks rate limiting på API routen og strukturert sikkerhetslogging. Man burde også å utvide tester så de dekker alt mer spesifikt.

## Konklusjon

Appen har et godt nivå for sikkerhet. Den bruker autentisering, validering på server side og tydelig feilhåndtering for å redusere de viktigste risikoene. Samtidig har jeg pekt på konkrete forbedringer som kan tas videre.