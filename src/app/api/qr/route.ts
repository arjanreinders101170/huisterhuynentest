import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";

// GET /api/qr?data=<text>&size=<px>
// Geeft een SVG QR-code terug voor de meegegeven tekst (meestal een URL).
// Wordt gebruikt door de admin fietsroutes-tab.
export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get("data");
  if (!data) return new NextResponse("Missing 'data'", { status: 400 });
  if (data.length > 2000) return new NextResponse("Data too long", { status: 400 });

  const sizeParam = request.nextUrl.searchParams.get("size");
  const size = Math.max(64, Math.min(1024, parseInt(sizeParam || "240", 10) || 240));

  try {
    const svg = await QRCode.toString(data, {
      type: "svg",
      width: size,
      margin: 1,
      color: { dark: "#2A2418", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse("QR generation failed", { status: 500 });
  }
}
