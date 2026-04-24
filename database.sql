CREATE DATABASE bookworm;
USE bookworm;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user'
);
SHOW TABLES;
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(100),
    rating DECIMAL(2,1),
    pdf_path VARCHAR(255),
    description TEXT,
    published_year INT,
    rating_count INT DEFAULT 0,
    cover_image VARCHAR(255),
    publisher VARCHAR(255),
    pages INT,
    language VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending'
);
SHOW TABLES;
CREATE TABLE reading_list (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    status VARCHAR(50),
    is_read TINYINT(1),
    is_liked TINYINT(1),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    review_title VARCHAR(255),
    review_text TEXT NOT NULL,
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    book_id INT,
    user_id INT,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE favorite_genres (
    fav_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    genre VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
SHOW TABLES;
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@gmail.com', 'admin123', 'admin');
SHOW TABLES;
ALTER TABLE books ADD uploaded_by INT;
ALTER TABLE books 
ADD FOREIGN KEY (uploaded_by) REFERENCES users(user_id);
ALTER TABLE books ADD approved_by INT;
ALTER TABLE books 
ADD FOREIGN KEY (approved_by) REFERENCES users(user_id);