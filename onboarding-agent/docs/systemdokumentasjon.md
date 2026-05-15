# Systemdokumentasjon

## Formål

Denne løsningen er laget for å gjennomføre en enkel onboarding av potensielle kunder. Bruker skriver inn selskapsnavn og svarer på åtte spørsmål i frontend. Etter det sendes dataen til backend, hvor den valideres, formateres og lagres i Payload. Hovedmålet er at dataflyten skal være forutsigbar og lett å vedlikeholde.

## Brukerflyt

Brukerflyten starter med innlogging via Clerk. Når brukeren er autentisert fylles selskapsnavn ut på første side, og etter det svares det på åtte spørsmål ang. selskapet. Frontend sender så hele payloaden til `POST /api/onboarding`. Backend validerer input og sender data videre til Payload gjennom en Cloudflare service binding. Så lages Company og Company Assets automatisk i Payload.

## Arkitektur og ansvarsdeling

Løsningen er delt i tydelige lag sånn at hver del har ett ansvar. Frontend i SvelteKit (`src/routes/+page.svelte` og `src/routes/sporsmal/+page.svelte`) samler inn data og viser eventuelle feil til bruker. API routen `src/routes/api/onboarding/+server.ts` fungerer som et kontrollpunkt for auth, formatkontroll og responskoder. Selve forretningslogikken ligger i onboarding-agenten (`src/lib/server/onboarding-agent.ts`), som håndterer runtime validering, mapping og oppretting i Payload.

Autentisering er samlet i `src/hooks.server.ts` og `src/hooks.client.ts`. Her sørger Clerk for at beskyttede ruter ikke kan brukes uten gyldig session. Payload nås ikke direkte fra klienten, men via bindingen `PAYLOAD_SERVICE` definert i `wrangler.jsonc`.

## Dataformat og validering

Endepunktet forventer et objekt med `companyName` og en `answers` array der hvert element har `question` og `answer`. Validering skjer i to lag. I frontend brukes `validateText` for tidlig feilmelding med grenser for minimum og maksimum tegn. I backend brukes `isValidOnboardingRequest` for å være sikker på at payloaden faktisk er gyldig før data sendes videre.

## Mapping mot Payload

Backend lager data i to steg. Først opprettes `company` hvor `companyId` genereres med UUID, `title` settes fra selskapsnavn og `key` bygges som en slug med `toCompanyKey`. Etter det opprettes `company-assets`, der de åtte svarene mappes til feltene under `basics` i riktig rekkefølge

## Sikkerhet og feilhåndtering

Routes for onboarding og API er beskyttet av Clerk. Hvis bruker ikke er innlogget, returnerer API `401`. Hvis runtime mangler nødvendig service binding, returneres `500`. Ugyldig input gir `400`, mens problemer mot Payload returnerer `502`.

I frontend brukes `AbortController` for timeout på innsendingen. Det skilles mellom timeout, nettverksfeil og serverfeil, slik at bruker får en forståelig melding

## Konfigurasjon og miljø

Cloudflare oppsettet definerer service bindingen `PAYLOAD_SERVICE` som peker mot Payload worker. Offentlig Clerk key ligger som public variabel, mens `CLERK_SECRET_KEY` ligger som hemmelig runtime konfigurasjon.

## Testing

Prosjektet har et enkelt test oppsett som dekker kjernen i løsningen. Validation rules i frontend, grunnleggende request validering i onboarding agenten og auth sperre på API routen.
