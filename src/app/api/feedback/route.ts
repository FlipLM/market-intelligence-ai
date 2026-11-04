import { NextResponse } from 'next/server';
import { getCommercialHistory, saveCommercialFeedback } from '@/lib/db';
import { CommercialFeedbackHistory } from '@/types/market';

export async function GET() {
  try {
    const history = getCommercialHistory();
    return NextResponse.json({ success: true, count: history.length, data: history });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const feedback: CommercialFeedbackHistory = {
      id: `fb-${Date.now()}`,
      nicheId: body.nicheId,
      nicheName: body.nicheName,
      recordedAt: new Date().toISOString(),
      companiesApproached: Number(body.companiesApproached) || 0,
      contactsMade: Number(body.contactsMade) || 0,
      responsesReceived: Number(body.responsesReceived) || 0,
      meetingsBooked: Number(body.meetingsBooked) || 0,
      proposalsSent: Number(body.proposalsSent) || 0,
      dealsClosed: Number(body.dealsClosed) || 0,
      negotiatedAvgTicket: Number(body.negotiatedAvgTicket) || 0,
      lostReasons: body.lostReasons || [],
      observedFriction: body.observedFriction || '',
      strategyAdjustments: body.strategyAdjustments || '',
    };

    saveCommercialFeedback(feedback);
    return NextResponse.json({ success: true, data: feedback });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

