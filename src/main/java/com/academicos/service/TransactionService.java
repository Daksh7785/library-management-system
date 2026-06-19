package com.academicos.service;

import com.academicos.exception.ResourceNotFoundException;
import com.academicos.model.BookCopy;
import com.academicos.model.Transaction;
import com.academicos.repository.BookCopyRepository;
import com.academicos.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Service layer for book borrowing / return transaction operations.
 */
@Service
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BookCopyRepository bookCopyRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              BookCopyRepository bookCopyRepository) {
        this.transactionRepository = transactionRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    public List<Transaction> findByUserId(String userId) {
        return transactionRepository.findByUserId(userId);
    }

    /**
     * Borrow a book — finds the first available copy and creates a transaction.
     *
     * @param bookId the book to borrow
     * @param userId the user borrowing
     * @return the created Transaction
     * @throws IllegalArgumentException if no copies are available
     */
    @Transactional
    public Transaction borrowBook(String bookId, String userId) {
        List<BookCopy> available = bookCopyRepository.findByBookIdAndStatus(bookId, "available");
        if (available.isEmpty()) {
            throw new IllegalArgumentException("No available copies for book id: " + bookId);
        }

        BookCopy copy = available.get(0);
        copy.setStatus("issued");
        bookCopyRepository.save(copy);

        Transaction tx = Transaction.builder()
                .id("tx-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8))
                .userId(userId)
                .copyId(copy.getId())
                .bookId(bookId)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .status("issued")
                .fine(0.0)
                .build();

        return transactionRepository.save(tx);
    }

    /**
     * Return a borrowed book — updates the transaction and frees the copy.
     *
     * @param transactionId the transaction ID
     * @return the updated Transaction
     * @throws ResourceNotFoundException if transaction not found
     * @throws IllegalArgumentException  if transaction is not in "issued" state
     */
    @Transactional
    public Transaction returnBook(String transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", transactionId));

        if (!"issued".equals(tx.getStatus())) {
            throw new IllegalArgumentException("Transaction " + transactionId + " is not in 'issued' state.");
        }

        tx.setStatus("returned");
        tx.setReturnDate(LocalDate.now());

        // Apply overdue fine: £0.50 per day
        if (LocalDate.now().isAfter(tx.getDueDate())) {
            long daysLate = tx.getDueDate().until(LocalDate.now()).getDays();
            tx.setFine(daysLate * 0.50);
        }

        transactionRepository.save(tx);

        BookCopy copy = bookCopyRepository.findById(tx.getCopyId())
                .orElseThrow(() -> new ResourceNotFoundException("BookCopy", "id", tx.getCopyId()));
        copy.setStatus("available");
        bookCopyRepository.save(copy);

        return tx;
    }
}
