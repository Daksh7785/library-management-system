package com.academicos.controller;

import com.academicos.model.Book;
import com.academicos.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    /** GET /api/books  or  GET /api/books?q=keyword */
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks(
            @RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(bookService.search(query));
    }

    /** GET /api/books/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        return ResponseEntity.ok(bookService.findById(id));
    }

    /** POST /api/books */
    @PostMapping
    public ResponseEntity<Book> createBook(@Valid @RequestBody Book book) {
        return ResponseEntity.ok(bookService.save(book));
    }

    /** DELETE /api/books/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable String id) {
        bookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
