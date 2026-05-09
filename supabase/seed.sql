-- Seed Books
INSERT INTO public.books (title, author, cover_url, category, rating, reviews_count, published_year, pages, language, synopsis, location, publisher, available)
VALUES 
('The Design of Everyday Things', 'Don Norman', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400', 'Design', 4.5, 1200, 2013, 368, 'English', 'A classic book on the principles of design and usability.', 'Shelf A-1', 'Basic Books', 5),
('Dune', 'Frank Herbert', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400', 'Fiction', 4.8, 3500, 1965, 412, 'English', 'Set in the distant future amidst a huge interstellar empire.', 'Shelf F-4', 'Chilton Books', 3),
('Clean Architecture', 'Robert C. Martin', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400', 'Computer Science', 4.7, 850, 2017, 432, 'English', 'A craftsman''s guide to software structure and design.', 'Shelf CS-2', 'Prentice Hall', 2),
('Atomic Habits', 'James Clear', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400', 'Self-Help', 4.9, 50000, 2018, 320, 'English', 'An easy and proven way to build good habits and break bad ones.', 'Shelf SH-1', 'Penguin Publishing Group', 10),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400', 'History', 4.6, 25000, 2011, 443, 'English', 'Explores the history of the human species from a fresh perspective.', 'Shelf H-5', 'Harper', 4);
