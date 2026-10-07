import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Bookmark, CheckCircle2 } from 'lucide-react';
import { Book } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';

interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => void;
  onReserve?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBorrow, onReserve }) => {
  const [imgError, setImgError] = useState(false);
  const isAvailable = book.available_copies > 0;

  const fallbackCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="book-card">
      <div className="book-card-cover-wrap">
        <img
          src={imgError ? fallbackCover : book.cover_url}
          alt={book.title}
          className="book-card-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className="book-card-status-badge">
          {isAvailable ? (
            <Badge variant="success" icon={<CheckCircle2 size={12} />}>
              {book.available_copies} Available
            </Badge>
          ) : (
            <Badge variant="warning" icon={<Bookmark size={12} />}>
              Unavailable
            </Badge>
          )}
        </div>
      </div>

      <div className="book-card-body">
        <span className="book-card-category">{book.category_name || 'Academic'}</span>
        <h4 className="book-card-title" title={book.title}>
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h4>
        <p className="book-card-author">{book.author}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="book-rating">
            <Star size={14} fill="#F59E0B" color="#F59E0B" />
            <span>{book.rating ? book.rating.toFixed(1) : '4.8'}</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            ISBN: {book.isbn.slice(0, 10)}...
          </span>
        </div>

        <div className="book-card-footer">
          <Link to={`/books/${book.id}`} style={{ flex: 1, marginRight: 8 }}>
            <Button variant="secondary" size="sm" style={{ width: '100%' }}>
              Details
            </Button>
          </Link>

          {isAvailable ? (
            <Button
              variant="primary"
              size="sm"
              icon={<BookOpen size={14} />}
              onClick={() => onBorrow && onBorrow(book)}
              style={{ flex: 1 }}
            >
              Borrow
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={<Bookmark size={14} />}
              onClick={() => onReserve && onReserve(book)}
              style={{ flex: 1 }}
            >
              Reserve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
