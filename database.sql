CREATE DATABASE IF NOT EXISTS bookworm;
USE bookworm;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS books (
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
    status VARCHAR(20) DEFAULT 'pending',
    uploaded_by INT,
    approved_by INT
);

CREATE TABLE IF NOT EXISTS reading_list (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    status VARCHAR(50),
    is_read TINYINT(1),
    is_liked TINYINT(1),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

CREATE TABLE IF NOT EXISTS reviews (
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

CREATE TABLE IF NOT EXISTS favorite_genres (
    fav_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    genre VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Default admin user
INSERT IGNORE INTO users (username, email, password, role)
VALUES ('admin', 'admin@gmail.com', 'admin123', 'admin');