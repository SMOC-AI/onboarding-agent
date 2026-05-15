# Brukerveiledning

## Formål

Denne veiledningen forklarer hvordan appen startes, brukes og testes i praksis. Dokumentet er skrevet for teknisk mottaker som skal kunne kjøre løsningen lokalt, verifisere at flyten virker, og feilsøke vanlige problemer.

## Hva appen gjør

Løsningen tar bruker gjennom en enkel onboarding flyt i to steg. Først skriver bruker inn selskapsnavn, så svarer bruker på åtte spørsmål om selskapet. Når skjemaet sendes inn, valideres dataen i backend før den sendes videre til Payload.

## Oppstart lokalt

Først må du laste ned avhengigheter:

```bash
npm install
```

Etter det kan du starte appen lokalt:

```bash
npm run dev
```

Hvis du vil kjøre nærmere Cloudflare runtime lokalt kan du bruke:

```bash
npm run preview
```

For autentisering og Worker oppsett må dette være på plass:
- `PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- service binding `PAYLOAD_SERVICE` i `wrangler.jsonc`

## Hvordan bruke appen

Hvis bruker ikke er innlogget, blir vedkommende sendt til Clerk sign in. Etter innlogging skriver brukeren inn selskapsnavn og går videre til spørsmålssiden. Hvert svar valideres og når siste svar sendes inn, vises enten en suksessmelding eller en konkret feilmelding.

## Hvordan teste at flyten virker

En enkel funksjonell test kan kjøres slik:

1. Logg inn.
2. Fyll inn selskapsnavn.
3. Svar på alle åtte spørsmål.
4. Send inn og se at suksessmelding vises.
5. Verifiser i Payload at både Company og Company Assets er opprettet.

Det er lurt å også teste minst en feilsituasjon for å bekrefte tilbakemelding.

## Vanlige feil og hva de betyr

Hvis du får melding om at bruker må logge inn betyr det at session mangler eller er utløpt. Hvis du får melding om manglende `PAYLOAD_SERVICE`, betyr det at service binding ikke er satt riktig i Worker configen. Ved melding om Payload feil eller nettverksfeil er problemet ofte at tredjeparts tjenesten er utilgjengelig eller at runtime miljøet ikke har riktig tilgang.

Hvis Clerk keys mangler vil beskyttede routes bli blokkert. Det er bevisst sikkerhetsoppførsel og må løses ved å sette riktige verdier i config.

## Vedlikehold og videre bruk

Ved endring av spørsmål må spørsmålslisten i frontend holdes synkront med mappingen i agenten. Ved endring av felter i Payload må mappingen i onboarding agenten oppdateres tilsvarende. Etter slike endringer bør flyten alltid retestes fra start til slutt, så både validering og alt med payload skriving er verifisert.