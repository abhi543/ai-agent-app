import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return NextResponse.next({
    request,
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/course/:path*",
    "/lesson/:path*",
    "/lesson-v2/:path*",
    "/create-course/:path*",
  ],
};