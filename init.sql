   CREATE TABLE IF NOT EXISTS offboarding (
        id SERIAL PRIMARY KEY,
        emp_id VARCHAR(7) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        department VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        laptop_returned VARCHAR(3) NOT NULL,
        phone_returned VARCHAR(3) NOT NULL,
        access_cards_returned VARCHAR(3) NOT NULL,
        final_paycheck INTEGER NOT NULL,
        benefits_cleared VARCHAR(3) NOT NULL,
        exit_interview TEXT NOT NULL,
        reason_for_leaving VARCHAR(50) NOT NULL,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
