package com.example.gbswer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GBSWERApplication {

	public static void main(String[] args) {
		SpringApplication.run(GBSWERApplication.class, args);
	}

}
