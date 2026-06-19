package com.academicos.repository;

import com.academicos.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String author, String description
    );
}
