import { isObjectEmpty } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticker, shares } = body;

    if (!ticker || !shares) {
      return NextResponse.json(
        {
          success: false,
          type: "client",
          message: "missing required properties",
        },
        { status: 400 }
      );
    }

    const stockBaseUrl = process.env.STOCK_API_BASE_URL;
    const token = process.env.STOCK_API_KEY;

    if (!stockBaseUrl || !token) {
      throw new Error("Missing API base URL or token.");
    }

    const profileUrl = `${stockBaseUrl}/stock/profile2?symbol=${ticker}&token=${token}`;
    const financialUrl = `${stockBaseUrl}/stock/metric?symbol=${ticker}&metric=all&token=${token}`;

    const [profileResponse, financialResponse] = await Promise.all([
      fetch(profileUrl),
      fetch(financialUrl),
    ]);

    if (!profileResponse.ok) {
      throw new Error(
        `Failed to fetch profile data: ${profileResponse.statusText}`
      );
    }
    if (!financialResponse.ok) {
      throw new Error(
        `Failed to fetch financial data: ${financialResponse.statusText}`
      );
    }

    const [profileData, financialData] = await Promise.all([
      profileResponse.json(),
      financialResponse.json(),
    ]);

    if (isObjectEmpty(profileData) || isObjectEmpty(financialData)) {
      return NextResponse.json(
        {
          success: false,
          type: "client",
          message: "Invalid ticker",
        },
        { status: 400 }
      );
    }

    const listingData: Listing = {
      name: profileData.name || "",
      currency: profileData.currency || "",
      ticker: profileData.ticker || "",
      userShares: shares || 0,
      exchange: profileData.exchange || "",
      logoUrl: profileData.logo || "",
      industry: profileData.finnhubIndustry || "",
      marketCapitalization: profileData.marketCapitalization || 0,
      shareOutstanding: profileData.shareOutstanding || 0,
      metrics: {
        "10DayAverageTradingVolume":
          financialData?.metric["10DayAverageTradingVolume"] || 0,
        "52WeekHigh": financialData?.metric["52WeekHigh"] || 0,
        "52WeekLow": financialData?.metric["52WeekLow"] || 0,
        "52WeekLowDate": financialData?.metric["52WeekLowDate"] || "",
        "52WeekPriceReturnDaily":
          financialData?.metric["52WeekPriceReturnDaily"] || 0,
        beta: financialData.metric?.beta || 0,
        netMargin: {
          period: financialData?.series?.annual?.netMargin[0]?.period,
          v: financialData?.series?.annual?.netMargin[0]?.v,
        },
      },
    };

    return NextResponse.json({
      success: true,
      type: "client",
      data: listingData,
    });
  } catch (error) {
    console.error("[LISTING_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        type: "server",
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
