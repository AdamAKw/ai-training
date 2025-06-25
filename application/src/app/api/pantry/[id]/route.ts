import { PantryItem, PantryItemValidation } from '@/models/pantryItem';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ID
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid pantry item ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const pantryItem = await PantryItem.findById(id);
    
    if (!pantryItem) {
      return NextResponse.json(
        { error: 'Pantry item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ pantryItem }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pantry item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pantry item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid pantry item ID format' },
        { status: 400 }
      );
    }
    
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
    
    // Update pantry item
    const updatedPantryItem = await PantryItem.findByIdAndUpdate(
      id,
      validatedData.data,
      { new: true, runValidators: true }
    );
    
    if (!updatedPantryItem) {
      return NextResponse.json(
        { error: 'Pantry item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ pantryItem: updatedPantryItem }, { status: 200 });
  } catch (error) {
    console.error('Error updating pantry item:', error);
    return NextResponse.json(
      { error: 'Failed to update pantry item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid pantry item ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const deletedPantryItem = await PantryItem.findByIdAndDelete(id);
    
    if (!deletedPantryItem) {
      return NextResponse.json(
        { error: 'Pantry item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Pantry item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    return NextResponse.json(
      { error: 'Failed to delete pantry item' },
      { status: 500 }
    );
  }
}
