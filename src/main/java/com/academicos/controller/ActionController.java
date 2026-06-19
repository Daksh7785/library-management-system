package com.academicos.controller;

import com.academicos.model.BookCopy;
import com.academicos.model.Transaction;
import com.academicos.repository.BookCopyRepository;
import com.academicos.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/api/action")
public class ActionController {

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @PostMapping("/borrow")
    public String borrowBook(@RequestParam String bookId, @RequestParam String userId) {
        List<BookCopy> copies = bookCopyRepository.findByBookIdAndStatus(bookId, "available");
        if (!copies.isEmpty()) {
            BookCopy copy = copies.get(0);
            copy.setStatus("issued");
            bookCopyRepository.save(copy);

            Transaction tx = new Transaction();
            tx.setId("tx-" + java.util.UUID.randomUUID().toString().substring(0, 8));
            tx.setUserId(userId);
            tx.setCopyId(copy.getId());
            tx.setBookId(bookId);
            tx.setIssueDate(new Date().toString());
            tx.setDueDate(new Date(System.currentTimeMillis() + 14 * 24 * 60 * 60 * 1000).toString()); // 14 days
            tx.setStatus("issued");
            tx.setFine(0.0);
            transactionRepository.save(tx);
        }
        return "redirect:/profile?userId=" + userId;
    }

    @PostMapping("/return")
    public String returnBook(@RequestParam String transactionId, @RequestParam String userId) {
        Transaction tx = transactionRepository.findById(transactionId).orElse(null);
        if (tx != null && "issued".equals(tx.getStatus())) {
            tx.setStatus("returned");
            tx.setReturnDate(new Date().toString());
            transactionRepository.save(tx);

            BookCopy copy = bookCopyRepository.findById(tx.getCopyId()).orElse(null);
            if (copy != null) {
                copy.setStatus("available");
                bookCopyRepository.save(copy);
            }
        }
        return "redirect:/profile?userId=" + userId;
    }
}
