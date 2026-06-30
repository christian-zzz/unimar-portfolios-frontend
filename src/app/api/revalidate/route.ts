import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { paths } = await request.json();

    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json(
        { message: "El campo 'paths' es requerido y debe ser un arreglo." },
        { status: 400 }
      );
    }

    for (const path of paths) {
      if (typeof path === "string") {
        revalidatePath(path);
      }
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Error al revalidar la ruta.", error: err.message },
      { status: 500 }
    );
  }
}
