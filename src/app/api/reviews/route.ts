import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId') || undefined;
  const all = searchParams.get('all') === 'true';

  const reviews = await storeService.getReviews({
    productId,
    approvedOnly: !all,
  });

  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.authorName || !body.comment || !body.rating) {
      return NextResponse.json({ error: 'Datos de reseña incompletos' }, { status: 400 });
    }

    const review = await storeService.createReview({
      productId: body.productId || 'general',
      productName: body.productName || 'Bohoart Jewelry',
      authorName: body.authorName,
      authorEmail: body.authorEmail || '',
      rating: Number(body.rating) || 5,
      title: body.title || null,
      comment: body.comment,
      isVerifiedBuyer: Boolean(body.isVerifiedBuyer),
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Error al enviar la reseña' }, { status: 500 });
  }
}
