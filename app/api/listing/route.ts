import { NextResponse } from "next/server";

import { isObjectEmpty } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticker, shares } = body;

    if (!ticker || !shares) {
      return NextResponse.json(
        {
          success: false,
          message: "missing required properties",
        },
        { status: 400 }
      );
    }

    const finnhubBaseUrl = "https://finnhub.io/api/v1/";
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      throw new Error("Missing API base URL or token.");
    }

    const profileUrl = `${finnhubBaseUrl}/stock/profile2?symbol=${ticker}&token=${apiKey}`;
    const financialUrl = `${finnhubBaseUrl}/stock/metric?symbol=${ticker}&metric=all&token=${apiKey}`;

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
      data: listingData,
    });
  } catch (error) {
    console.error("[LISTING_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
