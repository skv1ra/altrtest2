import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODELS = {
  macbook:
    "https://raw.githubusercontent.com/tejxv/minimal-portfolio/3e60d0fe07d3615db2ac63af9eb7d40758f29c39/public/models/macbook.glb",
  iphone:
    "https://raw.githubusercontent.com/Amir5470/Sera/233be13eacff4c04bb12a40c6c0cac2c9f4cfdce/docs/models/phone.glb",
} as const;

type Device = keyof typeof MODELS;

export async function GET(_: Request, { params }: { params: { device: string } }) {
  const device = params.device as Device;
  const source = MODELS[device];

  if (!source) {
    return NextResponse.json({ error: "Unknown hero model" }, { status: 404 });
  }

  try {
    const upstream = await fetch(source, {
      headers: {
        Accept: "model/gltf-binary,application/octet-stream;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `Unable to load ${device} model`, upstreamStatus: upstream.status },
        { status: 502 },
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Disposition": `inline; filename="altr-${device}.glb"`,
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(`Hero model proxy failed for ${device}`, error);
    return NextResponse.json({ error: `Unable to load ${device} model` }, { status: 502 });
  }
}
