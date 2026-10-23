package edu.cesar.taverna.bd.OP.dao;

import edu.cesar.taverna.bd.OP.entity.Verissimo;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;

import static edu.cesar.taverna.bd.OP.config.ConnectionFactory.getConnection;


public class VerissimoDAO extends GenericDAO<Verissimo> {

    private static final String selectByLogin =
            "SELECT id_verissimo, login, password_ver FROM VERISSIMO WHERE login = ?";

    @Override
    protected String getInsertSQL() {
        return "INSERT INTO VERISSIMO (login, password_ver, id_verissimo) VALUES (?, ?, ?)";
    }

    @Override
    protected String getSelectByIdSQL() {
        return "SELECT id_verissimo, login, password_ver FROM VERISSIMO WHERE id_verissimo = ?";
    }

    @Override
    protected String getSelectAllSQL() {
        return "SELECT id_verissimo, login, password_ver FROM VERISSIMO";
    }

    @Override
    protected String getDeleteSQL() {
        return "DELETE FROM VERISSIMO WHERE id_verissimo = ?";
    }

    @Override
    protected String getUpdateSQL() {
        return "UPDATE VERISSIMO SET login = ?, password_ver = ? WHERE id_verissimo = ?";
    }

    @Override
    protected void prepareInsert(PreparedStatement stmt, Verissimo verissimo) throws SQLException {
        stmt.setString(1, verissimo.getLogin());
        stmt.setString(2, verissimo.getPassword());
        stmt.setString(3, String.valueOf(verissimo.getId()));
    }

    @Override
    protected void prepareUpdate(PreparedStatement stmt, Verissimo verissimo) throws SQLException {
        this.prepareInsert(stmt, verissimo);
    }

    @Override
    protected Verissimo mapResultSetToEntity(ResultSet rs) throws SQLException {
        Verissimo verissimo = new Verissimo();

        verissimo.setId(UUID.fromString(rs.getString("id_verissimo")));
        verissimo.setLogin(rs.getString("login"));
        verissimo.setPassword(rs.getString("password_ver"));
        return verissimo;
    }

    public Verissimo findByLogin(String login) throws SQLException {
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(selectByLogin)) {
            stmt.setString(1, login);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToEntity(rs);
                }
                return null;
            }
        }
    }
}
