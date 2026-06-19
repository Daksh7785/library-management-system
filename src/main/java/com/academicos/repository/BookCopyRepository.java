package com.academicos.repository;

import com.academicos.model.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, String> {
    List<BookCopy> findByBookId(String bookId);
    List<BookCopy> findByBookIdAndStatus(String bookId, String status);
}
