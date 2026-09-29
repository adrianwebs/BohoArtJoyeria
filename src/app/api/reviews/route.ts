import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { getCurrentAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;
    // Only admins may list unapproved reviews.
    const all = searchParams.get('all') === 'true' && Boolean(await getCurrentAdmin());

    const reviews = await storeService.getReviews({ productId, approvedOnly: !all });
    return NextResponse.json(reviews);
  } catch (error) {
    return apiError(error, 'Error al cargar las reseñas');
  }
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
      isVerifiedBuyer: false,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return apiError(error, 'Error al enviar la reseña');
  }
}
