package com.academicos.controller;

import com.academicos.model.Book;
import com.academicos.model.BookCopy;
import com.academicos.model.Profile;
import com.academicos.model.Transaction;
import com.academicos.repository.BookCopyRepository;
import com.academicos.repository.BookRepository;
import com.academicos.repository.ProfileRepository;
import com.academicos.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/")
    public String index() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboardPage(@RequestParam(value = "userId", defaultValue = "demo-student-id") String userId, Model model) {
        Profile profile = profileRepository.findById(userId).orElse(null);
        model.addAttribute("profile", profile);
        model.addAttribute("totalBooks", bookRepository.count());
        model.addAttribute("recommendations", bookRepository.findAll().subList(0, Math.min(3, (int) bookRepository.count())));
        return "dashboard";
    }

    @GetMapping("/books")
    public String catalogPage(@RequestParam(value = "userId", defaultValue = "demo-student-id") String userId,
                              @RequestParam(value = "q", required = false) String query, Model model) {
        Profile profile = profileRepository.findById(userId).orElse(null);
        model.addAttribute("profile", profile);

        List<Book> books;
        if (query != null && !query.trim().isEmpty()) {
            books = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                    query, query, query
            );
        } else {
            books = bookRepository.findAll();
        }
        model.addAttribute("books", books);
        model.addAttribute("query", query);
        return "catalog";
    }

    @GetMapping("/book/{id}")
    public String bookDetailPage(@PathVariable String id,
                                 @RequestParam(value = "userId", defaultValue = "demo-student-id") String userId, Model model) {
        Profile profile = profileRepository.findById(userId).orElse(null);
        model.addAttribute("profile", profile);

        Book book = bookRepository.findById(id).orElse(null);
        model.addAttribute("book", book);

        List<BookCopy> copies = bookCopyRepository.findByBookId(id);
        model.addAttribute("copies", copies);
        
        long availableCount = copies.stream().filter(c -> "available".equals(c.getStatus())).count();
        model.addAttribute("availableCount", availableCount);

        return "book-detail";
    }

    @GetMapping("/profile")
    public String profilePage(@RequestParam(value = "userId", defaultValue = "demo-student-id") String userId, Model model) {
        Profile profile = profileRepository.findById(userId).orElse(null);
        model.addAttribute("profile", profile);

        List<Transaction> txList = transactionRepository.findByUserId(userId);
        List<Map<String, Object>> userLoans = new ArrayList<>();
        
        for (Transaction tx : txList) {
            Book book = bookRepository.findById(tx.getBookId()).orElse(null);
            userLoans.add(Map.of(
                "tx", tx,
                "book", book != null ? book : new Book()
            ));
        }
        model.addAttribute("loans", userLoans);
        return "profile";
    }
}
