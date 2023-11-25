import { Document, Model, Query } from 'mongoose';

export interface PaginateOptions {
  limit: number;
  page: number;
  total?: boolean;
}

export interface PaginationResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export async function paginate<T>(
  model: Model<Document>,
  query: Query<T[], Document>,
  options: PaginateOptions
): Promise<PaginationResult<T>> {
  const page = options.page || 1;
  const limit = options.limit || 10;

  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);
  const totalDocs = await model.countDocuments(query.getQuery());

  const totalPages = Math.ceil(totalDocs / limit);
  const docs = await query.exec();

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages,
  };
}