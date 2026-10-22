package edu.cesar.taverna.bd.OP.config;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import io.github.cdimascio.dotenv.Dotenv;

public class ConnectionFactory {
    private static final Dotenv dotenv;

    static {
        Dotenv loaded = null;
        try {
            if (new File(".env").exists()) {
                loaded = Dotenv.configure().directory("./").load();
            } else if (new File("./ordem-back/OP/.env").exists()) {
                loaded = Dotenv.configure().directory("./ordem-back/OP").load();
            } else {
                loaded = Dotenv.configure().ignoreIfMissing().load();
            }
        } catch (Exception e) {
            loaded = null;
        }
        dotenv = loaded;
    }

    private static String getEnvOrProperty(String key) {
        String val = System.getenv(key);
        if (val != null && !val.isBlank()) {
            return val;
        }
        val = System.getProperty(key);
        if (val != null && !val.isBlank()) {
            return val;
        }
        if (dotenv != null) {
            val = dotenv.get(key);
            if (val != null && !val.isBlank()) {
                return val;
            }
        }
        return null;
    }

    public static Connection getConnection() throws SQLException {
        String url = getEnvOrProperty("DB_URL");
        if (url == null) {
            url = getEnvOrProperty("SPRING_DATASOURCE_URL");
        }
        String user = getEnvOrProperty("DB_USER");
        if (user == null) {
            user = getEnvOrProperty("SPRING_DATASOURCE_USERNAME");
        }
        String password = getEnvOrProperty("DB_PASSWORD");
        if (password == null) {
            password = getEnvOrProperty("SPRING_DATASOURCE_PASSWORD");
        }
        return DriverManager.getConnection(url, user, password);
    }
}
