package edu.cesar.taverna.bd.OP.services.auth;

import edu.cesar.taverna.bd.OP.dao.QGDAO;
import edu.cesar.taverna.bd.OP.dao.VerissimoDAO;
import edu.cesar.taverna.bd.OP.entity.Verissimo;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.UUID;

@Service
public class AuthService {

    private final VerissimoDAO verDAO;
    private final QGDAO hqDAO;

    public AuthService () {
        this.verDAO = new VerissimoDAO();
        this.hqDAO = new QGDAO();
    }

    public UUID authenticate(String login,
                             String password,
                             HttpSession session) {

        try {
            System.out.println("Login: " + login);
            System.out.println("Senha digitada: " + password);

            Verissimo v = verDAO.findByLogin(login);
            if (v == null) {
                System.out.println("Usuário não encontrado");
            } else {
                System.out.println("Senha no banco: " + v.getPassword());
                System.out.println("Senha bate? " + v.getPassword().equals(password));
            }

            if (v != null && v.getPassword().equals(password)){
                UUID id_verissimo = v.getId();
                UUID id_hq = hqDAO.findQGIdByVerissimo(id_verissimo);

                session.setAttribute("id_verissimo", id_verissimo);
                session.setAttribute("login", login);
                session.setAttribute("id_hq", id_hq);

                return id_hq;

            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
