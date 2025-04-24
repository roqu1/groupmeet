package com.groupmeet.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${app.mail.sender.address}")
    private String senderEmail;

    @Value("${frontend.base.url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(to);
            message.setSubject("GroupMeet - Passwort zurücksetzen");

            // TODO: replace with actual frontend URL from GM-40
            String resetUrl = frontendBaseUrl + "/reset-password?token=" + token;

            message.setText("Hallo,\n\n"
                    + "Sie haben das Zurücksetzen des Passworts für Ihr GroupMeet-Konto angefordert.\n"
                    + "Bitte klicken Sie auf den folgenden Link, um ein neues Passwort festzulegen:\n"
                    + resetUrl + "\n\n"
                    + "Wenn Sie das Zurücksetzen des Passworts nicht angefordert haben, ignorieren Sie diese E-Mail.\n"
                    + "Der Link ist 15 Minuten lang gültig.\n\n"
                    + "Mit freundlichen Grüßen,\nDas GroupMeet-Team");

            javaMailSender.send(message);
            logger.info("Passwort-Zurücksetzungs-E-Mail erfolgreich an {} gesendet", to);
        } catch (MailException e) {
            logger.error("Fehler beim Senden der Passwort-Zurücksetzungs-E-Mail an {}: {}", to, e.getMessage());
        } catch (Exception e) {
            logger.error(
                    "Ein unerwarteter Fehler ist beim Senden der Passwort-Zurücksetzungs-E-Mail an {} aufgetreten: {}",
                    to, e.getMessage(), e);
        }
    }
}