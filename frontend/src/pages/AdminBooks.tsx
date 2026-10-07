import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Library, BookOpen, Search, X } from 'lucide-react';
import api from '../services/api';
import { Book, Category } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: 1,
    publisher: '',
    publication_year: 2024,
    pages: 400,
    language: 'English',
    description: '',
    total_copies: 3,
    cover_url: '',
  });

  const fetchBooksAndCategories = async () => {
    setIsLoading(true);
    try {
      const [booksRes, catsRes] = await Promise.all([
        api.getAdminBooks(),
        api.getCategories(),
      ]);
      if (booksRes.success && booksRes.data) {
        setBooks(booksRes.data);
      }
      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch catalog inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksAndCategories();
  }, []);

  const openAddModal = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category_id: categories[0]?.id || 1,
      publisher: '',
      publication_year: new Date().getFullYear(),
      pages: 420,
      language: 'English',
      description: '',
      total_copies: 4,
      cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category_id: book.category_id,
      publisher: book.publisher,
      publication_year: book.publication_year,
      pages: book.pages,
      language: book.language,
      description: book.description,
      total_copies: book.total_copies,
      cover_url: book.cover_url,
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.createBook(formData);
      showToast('Book successfully added to library catalog!', 'success');
      setIsAddModalOpen(false);
      fetchBooksAndCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to add book', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setIsSaving(true);
    try {
      await api.updateBook(editingBook.id, formData);
      showToast('Book details updated successfully!', 'success');
      setEditingBook(null);
      fetchBooksAndCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to update book', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingBook) return;
    setIsSaving(true);
    try {
      await api.deleteBook(deletingBook.id);
      showToast('Book removed from catalog.', 'success');
      setDeletingBook(null);
      fetchBooksAndCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete book', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Catalog Inventory Management</h1>
            <p className="page-subtitle">
              Add new acquisitions, update metadata, manage shelf copy counts, and withdraw titles.
            </p>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
            Add New Book
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search inventory by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              paddingLeft: 42,
              paddingRight: 16,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9375rem',
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading catalog records..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Copies</th>
                  <th>Available</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img
                          src={b.cover_url}
                          alt={b.title}
                          style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <div>
                          <strong style={{ color: 'var(--navy)', display: 'block' }}>{b.title}</strong>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{b.author}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{b.isbn}</td>
                    <td>
                      <Badge variant="primary">{b.category_name || 'Academic'}</Badge>
                    </td>
                    <td>{b.total_copies}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: b.available_copies > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {b.available_copies}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit2 size={13} />}
                          onClick={() => openEditModal(b)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Trash2 size={13} />}
                          style={{ color: 'var(--danger)' }}
                          onClick={() => setDeletingBook(b)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {(isAddModalOpen || editingBook) && (
        <Modal
          isOpen={isAddModalOpen || !!editingBook}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingBook(null);
          }}
          title={isAddModalOpen ? 'Add New Catalog Book' : `Edit: ${editingBook?.title}`}
          maxWidth="640px"
        >
          <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Book Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Input
                  label="Author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
                <Input
                  label="ISBN"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Select
                  label="Category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
                <Input
                  label="Publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <Input
                  label="Publication Year"
                  type="number"
                  value={formData.publication_year}
                  onChange={(e) => setFormData({ ...formData, publication_year: Number(e.target.value) })}
                />
                <Input
                  label="Pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
                />
                <Input
                  label="Copies"
                  type="number"
                  value={formData.total_copies}
                  onChange={(e) => setFormData({ ...formData, total_copies: Number(e.target.value) })}
                  required
                />
              </div>

              <Input
                label="Cover Image URL"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />

              <div className="form-group">
                <label className="form-label">Description / Summary</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of book content and topics..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBook(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  {isAddModalOpen ? 'Create Book' : 'Update Book'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBook && (
        <Modal
          isOpen={!!deletingBook}
          onClose={() => setDeletingBook(null)}
          title="Delete Book from Catalog"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeletingBook(null)} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteSubmit} isLoading={isSaving}>
                Confirm Delete
              </Button>
            </>
          }
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete <strong>"{deletingBook.title}"</strong> from the library catalog? This action will remove all catalog entries for this book.
          </p>
        </Modal>
      )}
    </div>
  );
};
