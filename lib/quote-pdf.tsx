import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { WeatherSealBookingPayload } from "@/lib/notifications";
import { PHONE_DISPLAY, EMAIL } from "@/lib/config";

const SEAL_LABELS: Record<string, string> = {
  bas: "Joint de bas de porte",
  lateraux: "Joints latéraux et de tête",
  reteneur: "Reteneur du bas",
  inconnu: "Inspection complète",
};

const PRICE_PER_FOOT: Record<string, number> = {
  bas: 5,
  lateraux: 7,
  reteneur: 10,
};

const FR_MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const FR_DAYS = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

function formatDateFr(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${FR_DAYS[dow]} ${d} ${FR_MONTHS[m - 1]} ${y}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

const RED = "#CC0000";
const DARK = "#1a1a1a";
const GRAY = "#6b7280";
const LIGHT = "#f9fafb";
const BORDER = "#e5e7eb";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: DARK, padding: 48, backgroundColor: "#fff" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  brandBlock: { flexDirection: "column" },
  brandName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: RED, letterSpacing: 0.5 },
  brandSub: { fontSize: 8, color: GRAY, marginTop: 2 },
  quoteBlock: { alignItems: "flex-end" },
  quoteTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: RED, letterSpacing: 1 },
  quoteNum: { fontSize: 8, color: GRAY, marginTop: 3 },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 24 },
  dividerRed: { borderBottomWidth: 2, borderBottomColor: RED, marginBottom: 24 },

  // Two-column info
  infoRow: { flexDirection: "row", gap: 24, marginBottom: 24 },
  infoBox: { flex: 1, backgroundColor: LIGHT, borderRadius: 6, padding: 12 },
  infoTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: RED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  infoLine: { fontSize: 9, color: DARK, marginBottom: 3, lineHeight: 1.4 },
  infoLineGray: { fontSize: 9, color: GRAY, marginBottom: 3 },

  // Table
  tableHeader: { flexDirection: "row", backgroundColor: DARK, borderRadius: 4, padding: "7 10", marginBottom: 1 },
  tableHeaderText: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", padding: "8 10", borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { flexDirection: "row", padding: "8 10", backgroundColor: LIGHT, borderBottomWidth: 1, borderBottomColor: BORDER },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "center" },
  col4: { flex: 1, textAlign: "right" },
  cellText: { fontSize: 9, color: DARK },
  cellTextBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: DARK },

  // Totals
  totalsBox: { marginTop: 12, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginBottom: 4 },
  totalLabel: { fontSize: 9, color: GRAY },
  totalValue: { fontSize: 9, color: DARK, fontFamily: "Helvetica-Bold" },
  totalFinalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, backgroundColor: RED, borderRadius: 4, padding: "8 10", marginTop: 6 },
  totalFinalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#fff" },
  totalFinalValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#fff" },

  // Payment box
  paymentBox: { marginTop: 28, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5", borderRadius: 6, padding: 14 },
  paymentTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: RED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  paymentLine: { fontSize: 9, color: DARK, marginBottom: 3, lineHeight: 1.5 },
  paymentBold: { fontFamily: "Helvetica-Bold" },

  // Footer
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: GRAY },
  footerBrand: { fontSize: 8, fontFamily: "Helvetica-Bold", color: RED },
});

function QuoteDocument({ data, quoteNum, today }: { data: WeatherSealBookingPayload; quoteNum: string; today: string }) {
  const measurableSeals = data.seals.filter((id) => id !== "inconnu" && data.measurements[id]);
  const hasInconnu = data.seals.includes("inconnu");
  const subtotal = measurableSeals.reduce((sum, id) => {
    const ft = parseFloat(data.measurements[id] || "0") || 0;
    return sum + ft * (PRICE_PER_FOOT[id] || 0);
  }, 0);
  const tps = subtotal * 0.05;
  const tvq = subtotal * 0.09975;
  const total = subtotal + tps + tvq;
  const validUntil = addDays(today, 30);

  return (
    <Document>
      <Page size="LETTER" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.brandBlock}>
            <Text style={s.brandName}>EXPERTS PORTES DE GARAGE</Text>
            <Text style={s.brandSub}>Service local en Estrie et Montérégie</Text>
            <Text style={[s.brandSub, { marginTop: 6 }]}>{PHONE_DISPLAY}</Text>
            <Text style={s.brandSub}>{EMAIL}</Text>
          </View>
          <View style={s.quoteBlock}>
            <Text style={s.quoteTitle}>SOUMISSION</Text>
            <Text style={s.quoteNum}>N° {quoteNum}</Text>
            <Text style={[s.quoteNum, { marginTop: 4 }]}>Émise le : {formatDateFr(today)}</Text>
            <Text style={s.quoteNum}>Valide jusqu'au : {formatDateFr(validUntil)}</Text>
          </View>
        </View>

        <View style={s.dividerRed} />

        {/* Client + RDV */}
        <View style={s.infoRow}>
          <View style={s.infoBox}>
            <Text style={s.infoTitle}>Client</Text>
            <Text style={[s.infoLine, { fontFamily: "Helvetica-Bold" }]}>{data.nom}</Text>
            <Text style={s.infoLine}>{data.adresse}</Text>
            <Text style={s.infoLine}>{data.ville}, QC  {data.codePostal}</Text>
            <Text style={s.infoLineGray}>{data.telephone}</Text>
            <Text style={s.infoLineGray}>{data.courriel}</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoTitle}>Rendez-vous prévu</Text>
            <Text style={[s.infoLine, { fontFamily: "Helvetica-Bold" }]}>{formatDateFr(data.date)}</Text>
            <Text style={s.infoLine}>{data.timeSlot}</Text>
            <Text style={[s.infoLine, { marginTop: 8 }]}>Service :</Text>
            <Text style={[s.infoLine, { fontFamily: "Helvetica-Bold", color: RED }]}>Remplacement de coupe-froid</Text>
            {data.color && data.color !== "__autre__" && (
              <Text style={s.infoLineGray}>Couleur : {data.color}</Text>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.col1]}>Description</Text>
          <Text style={[s.tableHeaderText, s.col2]}>Mesure</Text>
          <Text style={[s.tableHeaderText, s.col3]}>Prix/pied</Text>
          <Text style={[s.tableHeaderText, s.col4]}>Montant</Text>
        </View>

        {measurableSeals.map((id, i) => {
          const ft = parseFloat(data.measurements[id] || "0") || 0;
          const lineTotal = ft * (PRICE_PER_FOOT[id] || 0);
          const RowStyle = i % 2 === 1 ? s.tableRowAlt : s.tableRow;
          return (
            <View key={id} style={RowStyle}>
              <Text style={[s.cellText, s.col1]}>{SEAL_LABELS[id]}</Text>
              <Text style={[s.cellText, s.col2]}>{ft} pi</Text>
              <Text style={[s.cellText, s.col3]}>{PRICE_PER_FOOT[id]},00 $</Text>
              <Text style={[s.cellTextBold, s.col4]}>{lineTotal.toFixed(2)} $</Text>
            </View>
          );
        })}

        {hasInconnu && (
          <View style={s.tableRow}>
            <Text style={[s.cellText, s.col1]}>Inspection complète sur place</Text>
            <Text style={[s.cellText, s.col2]}>—</Text>
            <Text style={[s.cellText, s.col3]}>—</Text>
            <Text style={[s.cellTextBold, s.col4]}>À déterminer</Text>
          </View>
        )}

        {/* Totals */}
        {subtotal > 0 && (
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Sous-total</Text>
              <Text style={s.totalValue}>{subtotal.toFixed(2)} $</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TPS (5%)</Text>
              <Text style={s.totalValue}>{tps.toFixed(2)} $</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TVQ (9,975%)</Text>
              <Text style={s.totalValue}>{tvq.toFixed(2)} $</Text>
            </View>
            <View style={s.totalFinalRow}>
              <Text style={s.totalFinalLabel}>TOTAL</Text>
              <Text style={s.totalFinalValue}>{total.toFixed(2)} $</Text>
            </View>
          </View>
        )}

        {/* Payment instructions */}
        <View style={s.paymentBox}>
          <Text style={s.paymentTitle}>💳 Paiement en avance — Instructions</Text>
          <Text style={s.paymentLine}>
            Pour payer en avance par <Text style={s.paymentBold}>virement Interac</Text>, envoyez le montant total à :
          </Text>
          <Text style={[s.paymentLine, { fontFamily: "Helvetica-Bold", fontSize: 10 }]}>{EMAIL}</Text>
          <Text style={[s.paymentLine, { marginTop: 6 }]}>
            Référence : <Text style={s.paymentBold}>Soumission N° {quoteNum} — {data.nom}</Text>
          </Text>
          <Text style={[s.paymentLine, { marginTop: 6, color: GRAY, fontSize: 8 }]}>
            Le paiement sera confirmé par courriel avant votre rendez-vous. Pour toute question, appelez-nous au {PHONE_DISPLAY}.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerBrand}>EXPERTS PORTES DE GARAGE</Text>
          <Text style={s.footerText}>{PHONE_DISPLAY} · {EMAIL}</Text>
          <Text style={s.footerText}>N° {quoteNum}</Text>
        </View>

      </Page>
    </Document>
  );
}

export function generateQuoteNum(): string {
  const today = new Date().toISOString().split("T")[0];
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `EPG-${today.replace(/-/g, "")}-${rand}`;
}

export async function generateQuotePdf(data: WeatherSealBookingPayload, quoteNum: string): Promise<Buffer> {
  const today = new Date().toISOString().split("T")[0];
  const buf = await renderToBuffer(<QuoteDocument data={data} quoteNum={quoteNum} today={today} />);
  return Buffer.from(buf);
}
