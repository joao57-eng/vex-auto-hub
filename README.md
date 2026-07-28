<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b39825af-c7cb-4f52-977c-29c4f62401ff

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Aplicativo Android

O projeto também está configurado como aplicativo nativo com Capacitor.

1. Instale o [Android Studio](https://developer.android.com/studio) e configure um emulador ou conecte um celular Android com depuração USB ativada.
2. Gere e sincronize a versão mais recente da interface:
   `npm run cap:sync`
3. Abra o projeto nativo:
   `npx cap open android`
4. No Android Studio, use **Run** para testar ou **Build > Generate Signed Bundle / APK** para gerar o arquivo de publicação.

O site institucional continua em `/`; a experiência do aplicativo é entregue no pacote Android e usa a mesma conexão com Supabase.
