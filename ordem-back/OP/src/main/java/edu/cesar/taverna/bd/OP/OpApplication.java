package edu.cesar.taverna.bd.OP;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class OpApplication {

	public static void main(String[] args) {
		Dotenv dotenv = null;
		try {
			if (new File("./ordem-back/OP/.env").exists()) {
				dotenv = Dotenv.configure().directory("./ordem-back/OP").load();
			} else if (new File(".env").exists()) {
				dotenv = Dotenv.configure().directory("./").load();
			} else {
				dotenv = Dotenv.configure().ignoreIfMissing().load();
			}
		} catch (Exception ignored) {
		}

		String dbUrl = System.getenv("DB_URL");
		if (dbUrl == null && dotenv != null) {
			dbUrl = dotenv.get("DB_URL");
		}
		if (dbUrl == null) {
			dbUrl = System.getenv("SPRING_DATASOURCE_URL");
		}
		if (dbUrl != null) {
			System.setProperty("spring.datasource.url", dbUrl);
		}

		String dbUser = System.getenv("DB_USER");
		if (dbUser == null && dotenv != null) {
			dbUser = dotenv.get("DB_USER");
		}
		if (dbUser == null) {
			dbUser = System.getenv("SPRING_DATASOURCE_USERNAME");
		}
		if (dbUser != null) {
			System.setProperty("spring.datasource.username", dbUser);
		}

		String dbPassword = System.getenv("DB_PASSWORD");
		if (dbPassword == null && dotenv != null) {
			dbPassword = dotenv.get("DB_PASSWORD");
		}
		if (dbPassword == null) {
			dbPassword = System.getenv("SPRING_DATASOURCE_PASSWORD");
		}
		if (dbPassword != null) {
			System.setProperty("spring.datasource.password", dbPassword);
		}

		System.setProperty("spring.datasource.driver-class-name", "com.mysql.cj.jdbc.Driver");

		SpringApplication.run(OpApplication.class, args);
	}

}
