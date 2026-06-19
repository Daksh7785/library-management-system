package com.academicos.controller;

import com.academicos.model.Book;
import com.academicos.model.BookCopy;
import com.academicos.model.Profile;
import com.academicos.model.Transaction;
import com.academicos.repository.BookCopyRepository;
import com.academicos.service.BookService;
import com.academicos.service.ProfileService;
import com.academicos.service.TransactionService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
public class ViewController {

    private final BookService bookService;
    private final BookCopyRepository bookCopyRepository;
    private final ProfileService profileService;
    private final TransactionService transactionService;

    public ViewController(BookService bookService, BookCopyRepository bookCopyRepository,
                          ProfileService profileService, TransactionService transactionService) {
        this.bookService = bookService;
        this.bookCopyRepository = bookCopyRepository;
        this.profileService = profileService;
        this.transactionService = transactionService;
    }

    @GetMapping("/")
    public String index() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboardPage(
            @RequestParam(value = "userId", defaultValue = "demo-student-id") String userId,
            Model model) {
        Profile profile = profileService.findById(userId);
        model.addAttribute("profile", profile);
        model.addAttribute("totalBooks", bookService.count());
        model.addAttribute("recommendations", bookService.findTopN(3));
        return "dashboard";
    }

    @GetMapping("/books")
    public String catalogPage(
            @RequestParam(value = "userId", defaultValue = "demo-student-id") String userId,
            @RequestParam(value = "q", required = false) String query,
            Model model) {
        model.addAttribute("profile", profileService.findById(userId));
        model.addAttribute("books", bookService.search(query));
        model.addAttribute("query", query);
        return "catalog";
    }

    @GetMapping("/book/{id}")
    public String bookDetailPage(
            @PathVariable String id,
            @RequestParam(value = "userId", defaultValue = "demo-student-id") String userId,
            Model model) {
        model.addAttribute("profile", profileService.findById(userId));

        Book book = bookService.findById(id);
        model.addAttribute("book", book);

        List<BookCopy> copies = bookCopyRepository.findByBookId(id);
        model.addAttribute("copies", copies);
        long availableCount = copies.stream().filter(c -> "available".equals(c.getStatus())).count();
        model.addAttribute("availableCount", availableCount);

        return "book-detail";
    }

    @GetMapping("/profile")
    public String profilePage(
            @RequestParam(value = "userId", defaultValue = "demo-student-id") String userId,
            Model model) {
        Profile profile = profileService.findById(userId);
        model.addAttribute("profile", profile);

        List<Transaction> txList = transactionService.findByUserId(userId);
        List<Map<String, Object>> userLoans = new ArrayList<>();

        for (Transaction tx : txList) {
            Book book;
            try {
                book = bookService.findById(tx.getBookId());
            } catch (Exception e) {
                book = new Book();
            }
            userLoans.add(Map.of("tx", tx, "book", book));
        }
        model.addAttribute("loans", userLoans);
        return "profile";
    }
}
