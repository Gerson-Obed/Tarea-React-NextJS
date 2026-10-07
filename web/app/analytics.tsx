// app/analytics.tsx
// Google Analytics 4 con next/script. El ID sale de NEXT_PUBLIC_GA_ID (.env.local).
import Script from 'next/script';

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  if (!GA_ID) return null; // sin ID no se carga nada

  return (
    <>
      {/* afterInteractive: GA se carga DESPUÉS de que la página ya es usable,
          para no castigar el rendimiento en Lighthouse */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
