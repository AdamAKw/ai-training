import { PantryItem, PantryItemValidation } from '@/models/pantryItem';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const pantryItems = await PantryItem.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ pantryItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pantry items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = PantryItemValidation.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid pantry item data', issues: validatedData.error.issues },
        { status: 400 }
      );
    }
    
    // Create new pantry item
    const pantryItem = new PantryItem(validatedData.data);
    await pantryItem.save();
    
    return NextResponse.json({ pantryItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating pantry item:', error);
    return NextResponse.json(
      { error: 'Failed to create pantry item' },
      { status: 500 }
    );
  }
}
