import Script from "next/script";
import { GA4_ID, GOOGLE_ADS_ID } from "@/lib/gtag";

/** Balise Google (gtag.js) pour Google Ads + GA4 : conversions, remarketing et trafic. */
export default function GoogleTag() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');${GA4_ID ? `
gtag('config', '${GA4_ID}');` : ""}`}
      </Script>
    </>
  );
}
