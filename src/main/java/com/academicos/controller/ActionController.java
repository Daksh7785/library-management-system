package com.academicos.controller;

import com.academicos.service.TransactionService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/api/action")
public class ActionController {

    private final TransactionService transactionService;

    public ActionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /** POST /api/action/borrow */
    @PostMapping("/borrow")
    public String borrowBook(@RequestParam String bookId, @RequestParam String userId) {
        transactionService.borrowBook(bookId, userId);
        return "redirect:/profile?userId=" + userId;
    }

    /** POST /api/action/return */
    @PostMapping("/return")
    public String returnBook(@RequestParam String transactionId, @RequestParam String userId) {
        transactionService.returnBook(transactionId);
        return "redirect:/profile?userId=" + userId;
    }
}
